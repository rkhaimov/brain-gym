type QueueElement<T> = {
  value: T;
  next: QueueElement<T>;
};

class Queue<T> {
  private state: undefined | { head: QueueElement<T>; tail: QueueElement<T> };

  enqueue(value: T): void {
    if (this.state === undefined) {
      const element = { value } as QueueElement<T>;

      element.next = element;

      this.state = { head: element, tail: element };

      return;
    }

    const element: QueueElement<T> = { value, next: this.state.head };

    this.state.tail.next = element;
    this.state.tail = element;
  }

  dequeue(): T | undefined {
    if (this.state === undefined) {
      return undefined;
    }

    if (this.state.head === this.state.head.next) {
      const head = this.state.head;

      this.state = undefined;

      return head.value;
    }

    const head = this.state.head;

    this.state.head = head.next;
    this.state.tail.next = head.next;

    return head.value;
  }

  toArray() {
    const elements: T[] = [];

    if (this.state === undefined) {
      return elements;
    }

    let element = this.state.head;

    while (true) {
      if (elements.length > 0 && element === this.state.head) {
        return elements;
      }

      elements.push(element.value);

      element = element.next;
    }
  }
}

const list = new Queue<number>();

list.enqueue(1);
list.enqueue(2);
list.enqueue(3);
list.enqueue(4);

console.log(list.toArray()); // [ 4, 3, 2, 1 ]

list.dequeue();

console.log(list.toArray()); // [ 3, 4, 2, 1 ]
