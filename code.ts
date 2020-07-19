const HOURS_COUNT = 12;

createClock();

function createClock() {
  const clock = new Clock();
  const circle = new Circle(CLOCK_SIZE / 2);
  const render = new Render(clock.now());

  for (let hour = 1; hour <= HOURS_COUNT; hour++) {
    const position = Circle.LENGTH * hour / HOURS_COUNT;

    render.createClockNumberOrNot(hour, circle.getPositionOf(position));
  }

  clock.onSecondChange((second) => render.moveSecond(second));
  clock.onMinuteChange((minute) => render.moveMinute(minute));
  clock.onHourChange((hour) => render.moveHour(hour));
}
