export type Comparator<T> = (left: T, right: T) => number;

export class BinaryMinHeap<T> {
  private readonly values: T[] = [];

  constructor(private readonly compare: Comparator<T>) {}

  get size(): number {
    return this.values.length;
  }

  peek(): T | undefined {
    return this.values[0];
  }

  push(value: T): void {
    this.values.push(value);

    let index = this.values.length - 1;

    while (index > 0) {
      const pindex = this.parent(index);
      const comparator = this.compare(this.values[index], this.values[pindex]);

      if (comparator < 0) {
        // swap
        this.values[index] = this.values[pindex];
        this.values[pindex] = value;

        index = pindex;
      } else {
        break;
      }
    }
  }

  pop(): T | undefined {
    if (this.values.length === 0) {
      return undefined;
    }

    const peek = this.peek();
    const last = this.values.pop()!;

    if (this.values.length === 0) {
      return peek;
    }

    this.values[0] = last;

    let index = 0;

    while (true) {
      const [left, right] = this.children(index);

      if (left >= this.values.length) {
        break;
      }

      const smallest =
        right < this.values.length &&
        this.compare(this.values[right], this.values[left]) < 0
          ? right
          : left;

      if (this.compare(this.values[smallest], this.values[index]) >= 0) {
        break;
      }

      [this.values[index], this.values[smallest]] = [
        this.values[smallest],
        this.values[index],
      ];

      index = smallest;
    }

    return peek;
  }

  private children(index: number): [number, number] {
    const left = index * 2 + 1;

    return [left, left + 1];
  }

  private parent(index: number) {
    return Math.floor((index - 1) / 2);
  }
}
