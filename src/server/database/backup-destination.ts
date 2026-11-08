import { createHash } from 'node:crypto';
import { constants, copyFile, mkdir, open, readdir, readFile, rename, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { Mutex } from 'async-mutex';
import BetterSqlite3 from 'better-sqlite3';

export type BackupKind = 'routine' | 'pre-migration';

export interface PublishBackupRequest {
  readonly candidatePath: string;
  readonly createdAt: Date;
  readonly id: string;
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

function backupFilename(request: PublishBackupRequest): string {
  const timestamp = request.createdAt.toISOString().replaceAll(':', '-').replaceAll('.', '-');
  const id = request.id.replaceAll(/[^a-zA-Z0-9_-]/g, '-');
  return `${request.kind}-${timestamp}-${id}.sqlite`;
}

function isBackupName(name: string, kind: BackupKind): boolean {
  return name.startsWith(`${kind}-`) && name.endsWith('.sqlite');
}

function verifyDatabase(path: string): void {
  const database = new BetterSqlite3(path, { fileMustExist: true, readonly: true });
  try {
    const result = database.pragma('integrity_check');
    if (
      !Array.isArray(result) ||
      result.length !== 1 ||
      typeof result[0] !== 'object' ||
      result[0] === null ||
      Reflect.get(result[0], 'integrity_check') !== 'ok'
    ) {
      throw new Error(`SQLite integrity check failed for ${path}`);
    }
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

async function syncFile(path: string): Promise<void> {
  const file = await open(path, 'r+');
  try {
    await file.sync();
  } finally {
    await file.close();
  }
}

async function syncDirectory(path: string): Promise<void> {
  if (process.platform === 'win32') {
    return;
  }
  const directory = await open(path, 'r');
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
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
      return 'unchanged';
    }

    const finalName = backupFilename(request);
    const finalPath = join(this.#directory, finalName);
    const publishingPath = `${finalPath}.publishing`;
    try {
      await copyFile(request.candidatePath, publishingPath, constants.COPYFILE_EXCL);
      await syncFile(publishingPath);
      await rename(publishingPath, finalPath);
      await syncDirectory(this.#directory);
    } catch (error) {
      await rm(publishingPath, { force: true });
      throw error;
    }

    verifyDatabase(finalPath);

    const backupsToRemove = [...verifiedExistingNames, finalName].sort().reverse().slice(5);
    await Promise.all(
      backupsToRemove.map((name) => rm(join(this.#directory, name), { force: true })),
    );
    await syncDirectory(this.#directory);
    return 'published';
  }
}
