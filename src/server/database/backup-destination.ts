import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { Mutex } from 'async-mutex';
import BetterSqlite3 from 'better-sqlite3';

import { durablyReplaceFileWithCopy, syncDirectory } from './durable-file.js';
import { assertSqliteIntegrity } from './sqlite-integrity.js';

export type BackupKind = 'routine' | 'pre-migration';

export interface PublishBackupRequest {
  readonly backupId: string;
  readonly candidatePath: string;
  readonly createdAt: Date;
  readonly kind: BackupKind;
  readonly skipIfUnchanged: boolean;
}

export interface BackupDestination {
  runExclusive<T>(operation: () => Promise<T>): Promise<T>;
  publish(request: PublishBackupRequest): Promise<'published' | 'unchanged'>;
}

const destinationMutexes = new Map<string, Mutex>();
const FILESYSTEM_LOCK_RETRY_MS = 25;

function destinationMutex(directory: string): Mutex {
  const key = resolve(directory);
  const existing = destinationMutexes.get(key);
  if (existing !== undefined) {
    return existing;
  }
  const created = new Mutex();
  destinationMutexes.set(key, created);
  return created;
}

async function fileHash(path: string): Promise<string> {
  const contents = await readFile(path);
  return createHash('sha256').update(contents).digest('hex');
}

function backupSequence(name: string, kind: BackupKind): number {
  const sequence = name.slice(`${kind}-s`.length, `${kind}-s0000000000000000`.length);
  return /^\d{16}$/.test(sequence) ? Number(sequence) : 0;
}

function backupFilename(request: PublishBackupRequest, sequence: number): string {
  const timestamp = request.createdAt.toISOString().replaceAll(':', '-').replaceAll('.', '-');
  const backupId = request.backupId.replaceAll(/[^a-zA-Z0-9_-]/g, '-');
  const sortableSequence = String(sequence).padStart(16, '0');
  return `${request.kind}-s${sortableSequence}-${timestamp}-${backupId}.sqlite`;
}

function isBackupName(name: string, kind: BackupKind): boolean {
  return name.startsWith(`${kind}-`) && name.endsWith('.sqlite');
}

function verifyDatabase(path: string): void {
  const database = new BetterSqlite3(path, { fileMustExist: true, readonly: true });
  try {
    assertSqliteIntegrity(database, path);
  } finally {
    database.close();
  }
}

async function isVerifiedDatabase(path: string): Promise<boolean> {
  try {
    verifyDatabase(path);
    return true;
  } catch {
    return false;
  }
}

async function rotateVerifiedBackups(directory: string, namesNewestFirst: string[]): Promise<void> {
  const namesToRemove = namesNewestFirst.slice(5);
  if (namesToRemove.length === 0) {
    return;
  }
  await Promise.all(namesToRemove.map((name) => rm(join(directory, name), { force: true })));
  await syncDirectory(directory);
}

function errorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined;
  }
  return typeof error.code === 'string' ? error.code : undefined;
}

async function delay(milliseconds: number): Promise<void> {
  await new Promise<void>((resolveDelay) => {
    setTimeout(resolveDelay, milliseconds);
  });
}

async function acquireFilesystemLock(directory: string): Promise<() => Promise<void>> {
  await mkdir(directory, { recursive: true });
  const lockDatabase = new BetterSqlite3(join(directory, '.startup-lock.sqlite'), {
    timeout: FILESYSTEM_LOCK_RETRY_MS,
  });
  for (;;) {
    try {
      lockDatabase.exec('begin exclusive');
      return async () => {
        lockDatabase.exec('rollback');
        lockDatabase.close();
      };
    } catch (error) {
      if (errorCode(error) !== 'SQLITE_BUSY') {
        lockDatabase.close();
        throw error;
      }
      await delay(FILESYSTEM_LOCK_RETRY_MS);
    }
  }
}

export class LocalFilesystemBackupDestination implements BackupDestination {
  readonly #directory: string;
  readonly #mutex: Mutex;

  constructor(directory: string) {
    this.#directory = directory;
    this.#mutex = destinationMutex(directory);
  }

  async runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    return await this.#mutex.runExclusive(async () => {
      const releaseFilesystemLock = await acquireFilesystemLock(this.#directory);
      try {
        return await operation();
      } finally {
        await releaseFilesystemLock();
      }
    });
  }

  async publish(request: PublishBackupRequest): Promise<'published' | 'unchanged'> {
    await mkdir(this.#directory, { recursive: true });
    const existingNames = (await readdir(this.#directory))
      .filter((name) => isBackupName(name, request.kind))
      .sort()
      .reverse();
    const nextSequence =
      existingNames.reduce(
        (latestSequence, name) => Math.max(latestSequence, backupSequence(name, request.kind)),
        0,
      ) + 1;
    const verifiedExistingNames: string[] = [];
    for (const name of existingNames) {
      if (await isVerifiedDatabase(join(this.#directory, name))) {
        verifiedExistingNames.push(name);
      }
    }

    const latestName = verifiedExistingNames[0];
    if (
      request.skipIfUnchanged &&
      latestName !== undefined &&
      (await fileHash(request.candidatePath)) ===
        (await fileHash(join(this.#directory, latestName)))
    ) {
      await rotateVerifiedBackups(this.#directory, verifiedExistingNames);
      return 'unchanged';
    }

    const finalName = backupFilename(request, nextSequence);
    const finalPath = join(this.#directory, finalName);
    const publishingPath = `${finalPath}.publishing`;
    await durablyReplaceFileWithCopy({
      destinationPath: finalPath,
      exclusiveStaging: true,
      sourcePath: request.candidatePath,
      stagingPath: publishingPath,
    });

    try {
      verifyDatabase(finalPath);
    } catch (error) {
      await rm(finalPath, { force: true });
      await syncDirectory(this.#directory);
      throw error;
    }

    await rotateVerifiedBackups(
      this.#directory,
      [...verifiedExistingNames, finalName].sort().reverse(),
    );
    return 'published';
  }
}
