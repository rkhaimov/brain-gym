class Circle {
  static LENGTH = 2 * Math.PI;

  static normalizeAnge(rad: number) {
    return rad - Math.PI / 2;
  }

  constructor(private radius: number) {}

  getPositionOf(rad: number): IPoint {
    const offset = Math.PI / 2;
    const normilized = rad * -1 - offset;

    return {
      y: Math.sin(normilized) * this.radius,
      x: Math.cos(normilized) * this.radius,
    };
  }
}

class Render {
  private container!: HTMLDivElement;
  private second!: HTMLDivElement;
  private minute!: HTMLDivElement;
  private hour!: HTMLDivElement;

  constructor(now: ReturnType<Clock['now']>) {
    this.createContainer();
    this.createSecond(now);
    this.createMinute(now);
    this.createHour(now);

    this.container.appendChild(this.second);
    this.container.appendChild(this.hour);
    this.container.appendChild(this.minute);
  }

  createClockNumberOrNot(hour: number, point: IPoint) {
    const element = document.createElement('div');

    if (hour % 3 === 0) {
      element.innerText = hour.toString();
    } else {
      const angle = hour / 12 * Circle.LENGTH;

      element.classList.add('placeholder');
      element.style.transform = `translateX(50%) translateY(50%) rotate(${Circle.normalizeAnge(angle)}rad)`;
    }

    element.classList.add('hour');
    element.style.right = `${CLOCK_CENTER + point.x}`;
    element.style.bottom = `${CLOCK_CENTER - point.y}`;

    this.container.appendChild(element);
  }

  moveSecond(second: number) {
    const angle = second / 60 * Circle.LENGTH;

    this.second.style.transform = `translateX(-50%) translateY(-50%) rotate(${Circle.normalizeAnge(angle)}rad) scale(0.8)`;
  }

  moveMinute(minute: number) {
    const angle = minute / 60 * Circle.LENGTH;

    this.minute.style.transform = `translateX(-50%) translateY(-50%) rotate(${Circle.normalizeAnge(angle)}rad) scale(1.2)`;
  }

  moveHour(hour: number) {
    const angle = hour / 12 * Circle.LENGTH;

    this.hour.style.transform = `translateX(-50%) translateY(-50%) rotate(${Circle.normalizeAnge(angle)}rad) scale(1.5)`;
  }

  private createContainer() {
    this.container = document.createElement('div');
    this.container.classList.add('container');

    document.body.appendChild(this.container);
  }

  private createSecond(now: ReturnType<Clock['now']>) {
    this.second = document.createElement('div');
    this.second.classList.add('arrow');
    this.second.classList.add('second');

    this.moveSecond(now.second);
  }

  private createMinute(now: ReturnType<Clock['now']>) {
    this.minute = document.createElement('div');
    this.minute.classList.add('arrow');
    this.minute.classList.add('minute');

    this.moveMinute(now.minute);
  }

  private createHour(now: ReturnType<Clock['now']>) {
    this.hour = document.createElement('div');
    this.hour.classList.add('arrow');
    this.hour.classList.add('hour');

    this.moveHour(now.hour);
  }
}

const CLOCK_SIZE = 500 * 0.9;
const CLOCK_CENTER = 250;

class Clock {
  private date: Date;
  private intervalId: number;
  private subscribers: Array<() => unknown> = [];

  constructor() {
    this.date = new Date();

    this.intervalId = setInterval(() => {
      this.date.setTime(Date.now());

      this.subscribers.forEach((sub) => sub());
    }, 1_000);
  }

  now() {
    return {
      hour: this.date.getHours(),
      minute: this.date.getMinutes(),
      second: this.date.getSeconds(),
    };
  }

  onSecondChange(handleSecondChange: (second: number) => unknown) {
    this.subscribers.push(() => handleSecondChange(this.date.getSeconds()));
  }

  onMinuteChange(handleMinuteChange: (second: number) => unknown) {
    let last: number;

    this.subscribers.push(() => {
      const minutes = this.date.getMinutes();

      if (minutes === last) {
        return;
      }

      last = minutes;

      handleMinuteChange(last);
    });
  }

  onHourChange(handleHourChange: (second: number) => unknown) {
    let last: number;

    this.subscribers.push(() => {
      const hours = this.date.getHours();

      if (hours === last) {
        return;
      }

      last = hours;

      handleHourChange(last);
    });
  }

  destroy() {
    clearInterval(this.intervalId);
  }
}
