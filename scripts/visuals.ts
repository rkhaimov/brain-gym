import { performVisualChecks, VisualsMode } from '@reksoft/storyshots';
import { execSync } from 'child_process';
import * as path from 'path';

void performVisualChecks({
  mode: VisualsMode.Default,
  apiBase: 'http://fe-standards.reksoft.ru:6008',
  screenshotsFolder: path.join(process.cwd(), 'screenshots'),
  viewports: [{ width: 1920, height: 1080 }],
  workersNumber: 10,
  threshold: 0.1,
  retries: 1,
  getBundledStoriesFilePath: () => {
    execSync('build-storybook', { stdio: 'inherit' });

    return path.join(process.cwd(), 'storybook-static');
  },
});
