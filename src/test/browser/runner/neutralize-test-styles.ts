import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Plugin } from 'vite';

const styleRequest = /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:[?#].*)?$/i;
const cssModuleRequest =
  /\.module\.(?:css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:[?#].*)?$/i;
const htmlStyleRequest = /[?&]html-proxy(?:&|$)/;
const currentDirectory = dirname(fileURLToPath(import.meta.url));
const noopStylePath = resolve(currentDirectory, 'noop.css');
const noopCssModulePath = resolve(currentDirectory, 'noop.module.css');

export function createNeutralizeTestStylesPlugin(): Plugin {
  return {
    name: 'ceramics-neutralize-browser-test-styles',
    enforce: 'pre',
    resolveId(source, importer) {
      if (
        importer === undefined ||
        source.startsWith('/__test-application/') ||
        importer.startsWith('/__test-application/') ||
        htmlStyleRequest.test(source) ||
        !styleRequest.test(source)
      ) {
        return undefined;
      }

      return cssModuleRequest.test(source) ? noopCssModulePath : noopStylePath;
    },
  };
}
