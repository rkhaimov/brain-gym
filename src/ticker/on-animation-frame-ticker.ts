import { createTime, TimeTicker } from './types';

/**
 * A time ticker that triggers updates on every animation frame.
 * This ticker is ideal for smooth animations or simulations that require
 * high-frequency updates synchronized with the browser's rendering loop.
 */
export const onAnimationFrameTicker: TimeTicker = {
  start: (handle) => {
    let time: number | undefined;
    let stopped = false;

    requestIfNotStopped();

    function requestIfNotStopped() {
      requestAnimationFrame((curr) => {
        if (stopped) {
          return;
        }

        if (time === undefined) {
          time = curr;
        }

        handle(createTime(curr - time));

        requestIfNotStopped();
      });
    }

    return () => (stopped = true);
  },
};
