class LRUCache<K, V> {
  private list = new LinkedList<[K, V]>();
  private cache = new Map<K, ListNode<[K, V]>>();

  constructor(private capacity: number) {}

  get(key: K): V | undefined {
    const found = this.cache.get(key);

    if (found === undefined) {
      return undefined;
    }

    this.list.toFront(found);

    return found.value[1];
  }

  set(key: K, value: V): void {
    const found = this.cache.get(key);

    if (found) {
      found.value = [key, value];

      this.list.toFront(found);
    } else {
      this.cache.set(key, this.list.prepend([key, value]));
    }

    if (this.cache.size > this.capacity) {
      this.removeLRU();
    }
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    const found = this.cache.get(key);

    if (found === undefined) {
      return false;
    }

    this.list.remove(found);

    return this.cache.delete(key);
  }

  private removeLRU() {
    const removed = this.list.pop();

    if (removed) {
      this.cache.delete(removed.value[0]);
    }
  }
}

type ListNode<V> = {
  value: V;
  prev: ListNode<V>;
  next: ListNode<V>;
};

class LinkedList<V> {
  private head: ListNode<V> | undefined;

  prepend(value: V): ListNode<V> {
    if (this.head === undefined) {
      const node = { value } as ListNode<V>;

      node.next = node;
      node.prev = node;

      this.head = node;

      return node;
    }

    const node: ListNode<V> = { value, next: this.head, prev: this.head.prev };

    this.head.prev.next = node;
    this.head.prev = node;

    this.head = node;

    return node;
  }

  toFront(node: ListNode<V>) {
    if (this.head === undefined) {
      this.head = node;

      return;
    }

    node.prev.next = node.next;
    node.next.prev = node.prev;

    node.prev = this.head.prev;
    node.next = this.head;

    this.head.prev.next = node;
    this.head.prev = node;

    this.head = node;
  }

  remove(node: ListNode<V>) {
    if (node.next === node) {
      this.head = undefined;

      return;
    }

    node.prev.next = node.next;
    node.next.prev = node.prev;

    if (node === this.head) {
      this.head = node.next;
    }
  }

  pop(): ListNode<V> | undefined {
    if (this.head === undefined) {
      return;
    }

    const removed = this.head.prev;

    this.remove(removed);

    return removed;
  }

  toArray(): V[] {
    const visited = new Set<ListNode<V>>();
    const result = [];

    let element = this.head;

    while (element !== undefined) {
      if (visited.has(element)) {
        break;
      }

      visited.add(element);

      result.push(element.value);

      element = element.next;
    }

    return result;
  }
}

const list = new LinkedList<number>();

const first = list.prepend(1);
const second = list.prepend(2);
const third = list.prepend(3);
const fourth = list.prepend(4);

console.log(list.toArray()); // [ 4, 3, 2, 1 ]

list.toFront(third);

console.log(list.toArray()); // [ 3, 4, 2, 1 ]
