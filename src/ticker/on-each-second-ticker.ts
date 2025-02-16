import { createTime, TimeTicker } from './types';

export const onEachSecondTicker: TimeTicker = {
  start: (handle) => {
    let time = 0;

    handleNextTick();

    const interval = setInterval(() => {
      time += 1;

      handleNextTick();
    }, 1_000);

    function handleNextTick() {
      handle(createTime(time));
    }

    return () => clearInterval(interval);
  },
};
