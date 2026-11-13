import { useMutation, useQuery } from '@connectrpc/connect-query';
import { useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, MailCheck } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/client/components/ui/alert.js';
import { Button } from '@/client/components/ui/button.js';
import { formatRussianDateTime } from '@/client/lib/localization.js';
import {
  getReportImportStatus,
  importNewReportFiles,
} from '@/shared/gen/ceramics/v1/report_import-ReportImportService_connectquery.js';

export function ReportSyncPanel() {
  const queryClient = useQueryClient();
  const importStatus = useQuery(getReportImportStatus, {});
  const importMutation = useMutation(importNewReportFiles, {
    async onSuccess(response) {
      if (response.result.case === 'success') await queryClient.invalidateQueries();
    },
  });
  const importResult = importMutation.data?.result;
  const lastSyncedAtMs = importStatus.data?.lastSyncedAtMs;
  const importFailure =
    importMutation.error instanceof Error
      ? `Не удалось загрузить отчёты из почты: ${importMutation.error.message}`
      : importResult?.case === 'failure'
        ? [
            importResult.value.message,
            importResult.value.attachmentName,
            importResult.value.location,
          ]
            .filter(Boolean)
            .join(' · ')
        : undefined;

  return (
    <section
      aria-labelledby="mail-import-title"
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5 shadow-sm"
    >
      <div className="space-y-1">
        <h2 id="mail-import-title" className="flex items-center gap-2 font-semibold">
          <MailCheck aria-hidden="true" className="text-primary" />
          Отчёты из Яндекс Почты
        </h2>
        <p className="text-sm text-muted-foreground">
          Новые отчёты сразу пересчитают показатели обзора.
        </p>
        <p className="text-xs text-muted-foreground">
          {importStatus.isPending
            ? 'Проверяем последнюю синхронизацию…'
            : importStatus.isError
              ? 'Не удалось получить время последней синхронизации'
              : lastSyncedAtMs === undefined
                ? 'Синхронизация ещё не выполнялась'
                : `Последняя синхронизация: ${formatRussianDateTime(lastSyncedAtMs)}`}
        </p>
      </div>
      <Button
        disabled={importMutation.isPending}
        onClick={() => importMutation.mutate({})}
        type="button"
      >
        {importMutation.isPending ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" />
        ) : (
          <MailCheck aria-hidden="true" />
        )}
        {importMutation.isPending ? 'Загружаем отчёты…' : 'Загрузить отчёты из почты'}
      </Button>
      {importFailure === undefined ? null : (
        <Alert className="basis-full" variant="destructive">
          <AlertTitle>Импорт не выполнен</AlertTitle>
          <AlertDescription>{importFailure}</AlertDescription>
        </Alert>
      )}
      {importResult?.case === 'success' ? (
        <Alert className="basis-full border-success/40">
          <AlertTitle>
            {importResult.value.importedFileCount === 0 ? 'Новых отчётов нет' : 'Отчёты загружены'}
          </AlertTitle>
          {importResult.value.importedFileCount === 0 ? null : (
            <AlertDescription>
              Файлов: {importResult.value.importedFileCount}; отчётов:{' '}
              {importResult.value.createdReportCount}; магазинов:{' '}
              {importResult.value.createdOutletCount}; позиций:{' '}
              {importResult.value.createdReportListingCount}.
            </AlertDescription>
          )}
        </Alert>
      ) : null}
    </section>
  );
}
