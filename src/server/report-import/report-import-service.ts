import { create } from '@bufbuild/protobuf';
import type { ConnectRouter, ServiceImpl } from '@connectrpc/connect';
import { Mutex } from 'async-mutex';

import {
  ImportNewReportFilesResponseSchema,
  ReportImportFailureSchema,
  ReportImportService,
  ReportImportSuccessSchema,
} from '../../shared/gen/ceramics/v1/report_import_pb.js';
import { CreateSalesReportRequestSchema } from '../../shared/gen/ceramics/v1/sales_report_pb.js';
import { normalizeSalesReport, validateSalesReport } from '../../shared/sales-report-validation.js';
import type { ApplicationDatabase } from '../database/database.js';
import type { EnvService } from '../env.js';
import type { MutationQueue } from '../mutation-queue.js';
import {
  nextSavedAtMs,
  replaceReportContents,
  resolveListings,
} from '../sales-report/sales-report-service.js';
import { parseReportFile, ReportFileParseError } from './report-file-parser.js';
import type { ParsedReportFile } from './report-file-parser.js';
import type { ReportMailbox } from './report-mailbox.js';

export interface ReportImportRouteDependencies {
  readonly database: ApplicationDatabase;
  readonly env: EnvService;
  readonly mailbox: ReportMailbox;
  readonly mutationQueue: MutationQueue;
}

const IMPORT_STATE_ID = 1;

function normalizedMailboxAccount(mailbox: ReportMailbox): string {
  return mailbox.account.trim().toLocaleLowerCase('ru-RU');
}

function success(value: {
  readonly createdOutletCount: number;
  readonly createdReportCount: number;
  readonly createdReportListingCount: number;
  readonly importedFileCount: number;
}) {
  return create(ImportNewReportFilesResponseSchema, {
    result: { case: 'success', value: create(ReportImportSuccessSchema, value) },
  });
}

function failure(
  message: string,
  details: Readonly<{ attachmentName?: string; location?: string }> = {},
) {
  return create(ImportNewReportFilesResponseSchema, {
    result: {
      case: 'failure',
      value: create(ReportImportFailureSchema, {
        message,
        ...(details.attachmentName === undefined ? {} : { attachmentName: details.attachmentName }),
        ...(details.location === undefined ? {} : { location: details.location }),
      }),
    },
  });
}

async function saveImportedBatch(
  dependencies: ReportImportRouteDependencies,
  parsedFiles: readonly ParsedReportFile[],
  scan: Readonly<{ lastScannedUid: number; uidValidity: number }>,
) {
  const { database, env, mailbox, mutationQueue } = dependencies;
  return mutationQueue.run(async () =>
    database.db.transaction().execute(async (transaction) => {
      const listingCountBefore = await transaction
        .selectFrom('report_listings')
        .select(({ fn }) => fn.countAll<number>().as('count'))
        .executeTakeFirstOrThrow();
      let createdOutletCount = 0;
      let createdReportCount = 0;

      for (const parsedFile of parsedFiles) {
        for (const parsedOutlet of parsedFile.outlets) {
          let outlet = await transaction
            .selectFrom('outlets')
            .select('id')
            .where('name', '=', parsedOutlet.name)
            .executeTakeFirst();
          if (outlet === undefined) {
            outlet = { id: env.randomUUID() };
            await transaction
              .insertInto('outlets')
              .values({
                created_at_ms: env.now().getTime(),
                id: outlet.id,
                name: parsedOutlet.name,
              })
              .executeTakeFirstOrThrow();
            createdOutletCount += 1;
          }

          const request = normalizeSalesReport(
            create(CreateSalesReportRequestSchema, {
              outletId: outlet.id,
              periodEndDate: parsedFile.periodEndDate,
              periodStartDate: parsedFile.periodStartDate,
              sales: [...parsedOutlet.sales],
              stockBalances: [...parsedOutlet.stockBalances],
            }),
          );
          const validationFailure = validateSalesReport(request)[0];
          if (validationFailure !== undefined) {
            throw new Error(validationFailure.message);
          }
          const listings = await resolveListings(transaction, env, request);
          const timestamp = await nextSavedAtMs(transaction, env);
          const reportId = env.randomUUID();
          await transaction
            .insertInto('sales_reports')
            .values({
              archived_at_ms: null,
              created_at_ms: timestamp,
              id: reportId,
              outlet_id: outlet.id,
              period_end_date: request.periodEndDate,
              period_start_date: request.periodStartDate,
              updated_at_ms: timestamp,
            })
            .executeTakeFirstOrThrow();
          await replaceReportContents(transaction, reportId, request, listings);
          createdReportCount += 1;
        }
      }

      await transaction
        .insertInto('report_mail_import_state')
        .values({
          id: IMPORT_STATE_ID,
          last_scanned_uid: scan.lastScannedUid,
          mailbox_account: normalizedMailboxAccount(mailbox),
          uid_validity: scan.uidValidity,
          updated_at_ms: env.now().getTime(),
        })
        .onConflict((conflict) =>
          conflict.column('id').doUpdateSet({
            last_scanned_uid: scan.lastScannedUid,
            mailbox_account: normalizedMailboxAccount(mailbox),
            uid_validity: scan.uidValidity,
            updated_at_ms: env.now().getTime(),
          }),
        )
        .executeTakeFirstOrThrow();

      const listingCountAfter = await transaction
        .selectFrom('report_listings')
        .select(({ fn }) => fn.countAll<number>().as('count'))
        .executeTakeFirstOrThrow();
      return success({
        createdOutletCount,
        createdReportCount,
        createdReportListingCount: listingCountAfter.count - listingCountBefore.count,
        importedFileCount: parsedFiles.length,
      });
    }),
  );
}

function createReportImportService(
  dependencies: ReportImportRouteDependencies,
): ServiceImpl<typeof ReportImportService> {
  const importMutex = new Mutex();
  const { database, mailbox } = dependencies;

  return {
    importNewReportFiles: () =>
      importMutex.runExclusive(async () => {
        const state = await database.db
          .selectFrom('report_mail_import_state')
          .selectAll()
          .where('id', '=', IMPORT_STATE_ID)
          .executeTakeFirst();
        if (state !== undefined && state.mailbox_account !== normalizedMailboxAccount(mailbox)) {
          return failure('Настроен другой почтовый ящик. Сбросьте состояние импорта вручную.');
        }

        try {
          const scan = await mailbox.scan(
            state === undefined
              ? undefined
              : { lastScannedUid: state.last_scanned_uid, uidValidity: state.uid_validity },
          );
          if (state !== undefined && scan.uidValidity !== state.uid_validity) {
            return failure(
              'Яндекс изменил идентификатор INBOX. Автоматический повторный импорт остановлен.',
            );
          }

          const parsedFiles: ParsedReportFile[] = [];
          for (const attachment of scan.attachments) {
            try {
              parsedFiles.push(await parseReportFile(attachment.source));
            } catch (error) {
              if (error instanceof ReportFileParseError) {
                return failure(error.userMessage, {
                  attachmentName: attachment.filename,
                  ...(error.location === undefined ? {} : { location: error.location }),
                });
              }
              throw error;
            }
          }
          return await saveImportedBatch(dependencies, parsedFiles, scan);
        } catch (error) {
          return failure(
            `Не удалось загрузить отчёты из почты: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`,
          );
        }
      }),
  };
}

export function registerReportImportRoutes(
  router: ConnectRouter,
  dependencies: ReportImportRouteDependencies,
): void {
  router.service(ReportImportService, createReportImportService(dependencies));
}
