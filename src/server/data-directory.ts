import { resolve } from 'node:path';

export function resolveApplicationDataDirectory(
  configuredDirectory: string | undefined,
  workingDirectory = process.cwd(),
): string {
  const directory = configuredDirectory?.trim();
  if (directory === undefined || directory.length === 0) {
    throw new Error('CERAMICS_DATA_DIR must name the application data directory');
  }
  return resolve(workingDirectory, directory);
}
