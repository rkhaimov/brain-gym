import { constants, copyFile, open, rename, rm } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface DurableFileReplacement {
  readonly destinationPath: string;
  readonly exclusiveStaging?: boolean;
  readonly sourcePath: string;
  readonly stagingPath: string;
}

async function syncFile(path: string): Promise<void> {
  const file = await open(path, 'r+');
  try {
    await file.sync();
  } finally {
    await file.close();
  }
}

export async function syncDirectory(path: string): Promise<void> {
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

export async function durablyReplaceFileWithCopy(
  replacement: DurableFileReplacement,
): Promise<void> {
  try {
    await copyFile(
      replacement.sourcePath,
      replacement.stagingPath,
      replacement.exclusiveStaging ? constants.COPYFILE_EXCL : 0,
    );
    await syncFile(replacement.stagingPath);
    await rename(replacement.stagingPath, replacement.destinationPath);
    await syncFile(replacement.destinationPath);
    await syncDirectory(dirname(replacement.destinationPath));
  } catch (error) {
    await rm(replacement.stagingPath, { force: true });
    throw error;
  }
}
