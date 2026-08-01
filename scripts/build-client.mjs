import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { build } from 'esbuild';

const rootDir = process.cwd();
const distDir = join(rootDir, 'dist');

await mkdir(distDir, { recursive: true });

await build({
  entryPoints: [join(rootDir, 'src', 'browser', 'index.ts')],
  outfile: join(distDir, 'index.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  sourcemap: true
});

await copyFile(join(rootDir, 'src', 'browser', 'index.html'), join(distDir, 'index.html'));

