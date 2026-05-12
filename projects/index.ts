import { renderToPipeableStream } from 'react-dom/server';

renderToPipeableStream(0, {
  onShellReady: () => {},
});