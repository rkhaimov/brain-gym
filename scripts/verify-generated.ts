import { glob, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

async function generatedSources(): Promise<Map<string, string>> {
  const sources = new Map<string, string>();
  for await (const path of glob('src/shared/gen/**/*.ts')) {
    sources.set(path, await readFile(path, 'utf8'));
  }
  return sources;
}

function run(command: string, argumentsForCommand: readonly string[]): void {
  const result = spawnSync(command, argumentsForCommand, { stdio: 'inherit' });
  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status ?? 'unknown'}`);
  }
}

const before = await generatedSources();
run(process.execPath, ['node_modules/@bufbuild/buf/bin/buf', 'lint']);
run(process.execPath, ['node_modules/@bufbuild/buf/bin/buf', 'generate']);
const after = await generatedSources();
const paths = new Set([...before.keys(), ...after.keys()]);
const changed = [...paths].filter((path) => before.get(path) !== after.get(path));
if (changed.length > 0) {
  throw new Error(`Generated Protobuf artifacts were stale:\n${changed.join('\n')}`);
}

run(process.execPath, [
  'node_modules/tsx/dist/cli.mjs',
  'scripts/generate-database-types.ts',
  '--verify',
]);
