import { Readable, Writable } from 'node:stream';
import { buffer } from 'node:stream/consumers';
import { pipeline } from 'node:stream/promises';

import { Splitter, Streamer } from '@zone-eu/mailsplit';
import { ImapFlow } from 'imapflow';

import type {
  ReportMailAttachment,
  ReportMailCursor,
  ReportMailbox,
  ReportMailboxScan,
} from './report-mailbox.js';

const SEARCH_UID_WINDOW = 5_000;

function noMessages(): Array<Readonly<{ source?: Buffer; uid: number }>> {
  return [];
}

function normalizedFilename(value: string): string {
  return value.trim().toLocaleLowerCase('ru-RU').replaceAll('ё', 'е');
}

export function isYandexReportFilename(value: string): boolean {
  const normalized = normalizedFilename(value);
  return normalized.includes('отчет по продажам') && normalized.endsWith('.xlsx');
}

export async function extractYandexReportAttachments(
  messageSource: Buffer,
): Promise<ReadonlyArray<Readonly<{ filename: string; source: Buffer }>>> {
  const attachments: Array<Readonly<{ filename: string; source: Buffer }>> = [];
  const pending: Array<Promise<void>> = [];
  const splitter = new Splitter();
  const streamer = new Streamer(
    (node) => node.filename !== false && isYandexReportFilename(node.filename),
  );
  streamer.on('node', ({ decoder, done, node }) => {
    pending.push(
      buffer(decoder)
        .then((source) => {
          if (node.filename === false) throw new Error('Имя вложения отсутствует');
          attachments.push({ filename: node.filename, source });
        })
        .finally(done),
    );
  });
  await pipeline(
    Readable.from([messageSource]),
    splitter,
    streamer,
    new Writable({
      objectMode: true,
      write(_chunk, _encoding, callback) {
        callback();
      },
    }),
  );
  await Promise.all(pending);
  return attachments;
}

function requiredEnvironment(name: 'YANDEX_MAIL_APP_PASSWORD' | 'YANDEX_MAIL_USER'): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Не задана переменная ${name}`);
  return value;
}

function createClient(user: string, password: string): ImapFlow {
  return new ImapFlow({
    auth: { pass: password, user },
    disableAutoIdle: true,
    host: 'imap.yandex.ru',
    logger: false,
    port: 993,
    secure: true,
  });
}

async function withReadOnlyInbox<T>(
  user: string,
  password: string,
  operation: (
    client: ImapFlow,
    mailbox: Readonly<{ lastUid: number; uidValidity: number }>,
  ) => Promise<T>,
): Promise<T> {
  const client = createClient(user, password);
  let connected = false;
  try {
    await client.connect();
    connected = true;
    const lock = await client.getMailboxLock('INBOX', { readOnly: true });
    try {
      if (client.mailbox === false) throw new Error('Не удалось открыть INBOX');
      const uidValidity = Number(client.mailbox.uidValidity);
      if (!Number.isSafeInteger(uidValidity)) {
        throw new Error('INBOX вернул недопустимый UIDVALIDITY');
      }
      return await operation(client, {
        lastUid: Math.max(0, client.mailbox.uidNext - 1),
        uidValidity,
      });
    } finally {
      lock.release();
    }
  } finally {
    if (connected && !client.isClosed) {
      try {
        await client.logout();
      } catch {
        client.close();
      }
    }
  }
}

export function createYandexReportMailboxFromEnvironment(): ReportMailbox {
  const configuredAccount =
    process.env['YANDEX_MAIL_USER']?.trim().toLocaleLowerCase('ru-RU') ?? '';
  return {
    account: configuredAccount,
    async scan(cursor: ReportMailCursor | undefined): Promise<ReportMailboxScan> {
      const user = requiredEnvironment('YANDEX_MAIL_USER');
      const password = requiredEnvironment('YANDEX_MAIL_APP_PASSWORD');
      const scan = await withReadOnlyInbox(user, password, async (client, mailbox) => {
        if (cursor !== undefined && cursor.uidValidity !== mailbox.uidValidity) {
          return { messages: noMessages(), ...mailbox };
        }
        if (cursor !== undefined && mailbox.lastUid <= cursor.lastScannedUid) {
          return { messages: noMessages(), ...mailbox };
        }
        const firstUid = (cursor?.lastScannedUid ?? 0) + 1;
        const uids: number[] = [];
        for (let startUid = firstUid; startUid <= mailbox.lastUid; startUid += SEARCH_UID_WINDOW) {
          const endUid = Math.min(mailbox.lastUid, startUid + SEARCH_UID_WINDOW - 1);
          const found = await client.search(
            { text: 'Твоя полка', uid: `${String(startUid)}:${String(endUid)}` },
            { uid: true },
          );
          if (found === false) throw new Error('Яндекс отклонил поиск писем');
          uids.push(...(found ?? []));
        }
        const messages =
          uids.length === 0
            ? noMessages()
            : await client.fetchAll(uids, { source: true, uid: true }, { uid: true });
        return { messages, ...mailbox };
      });
      if (cursor !== undefined && cursor.uidValidity !== scan.uidValidity) {
        return {
          attachments: [],
          lastScannedUid: cursor.lastScannedUid,
          uidValidity: scan.uidValidity,
        };
      }
      const attachments: ReportMailAttachment[] = [];
      for (const message of scan.messages) {
        if (message.source === undefined) {
          throw new Error(`Не удалось скачать письмо UID ${String(message.uid)}`);
        }
        const extracted = await extractYandexReportAttachments(message.source);
        if (extracted.length === 0) continue;
        if (extracted.length !== 1) {
          throw new Error(`Письмо UID ${String(message.uid)} содержит несколько отчётов`);
        }
        const attachment = extracted[0];
        if (attachment !== undefined) attachments.push({ ...attachment, uid: message.uid });
      }
      return {
        attachments,
        lastScannedUid: scan.lastUid,
        uidValidity: scan.uidValidity,
      };
    },
  };
}
