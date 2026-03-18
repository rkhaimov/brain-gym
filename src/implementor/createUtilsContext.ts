import fs from 'node:fs';
import path from 'node:path';
import { Utils, UtilsSchema } from './schemas';

export function createUtilsContext(): Utils {
  const files = fs.globSync('utils/*.ts');
  const modules = files.map((file) => {
    const module = `@utils/${path.parse(file).name}`;
    const source = fs.readFileSync(file, 'utf8');

    return { module, source };
  });

  return UtilsSchema.parse(modules);
}
