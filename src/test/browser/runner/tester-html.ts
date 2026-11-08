import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const testerHtmlPath = resolve('node_modules/.vitest/ceramics-tester.html');

const stableTestStyles = `
  *,
  *::before,
  *::after {
    animation: none !important;
    animation-delay: 0s !important;
    animation-duration: 0s !important;
    animation-iteration-count: 1 !important;
    caret-color: transparent !important;
    scroll-behavior: auto !important;
    transition: none !important;
    transition-delay: 0s !important;
    transition-duration: 0s !important;
  }
`;

export function createTesterHtmlPath(): string {
  const applicationHtml = readFileSync(resolve('index.html'), 'utf8');
  const withoutDevelopmentEntry = applicationHtml.replace(
    '    <script type="module" src="/src/client/main.tsx"></script>\n',
    '',
  );
  const testerHtml = withoutDevelopmentEntry.replace(
    '  </head>',
    `    <link rel="stylesheet" href="/__test-application/application.css" />
    <script type="module" vite-ignore>
      try {
        window.testApplication = await import('/__test-application/application.js');
      } catch (error) {
        window.testApplicationLoadError = String(error instanceof Error ? error.stack : error);
      }
    </script>
    <style id="ceramics-browser-test-styles">${stableTestStyles}</style>
  </head>`,
  );

  mkdirSync(dirname(testerHtmlPath), { recursive: true });
  writeFileSync(testerHtmlPath, testerHtml);
  return testerHtmlPath;
}
