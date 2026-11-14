import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { BinaryMinHeap } from "./index";

const ascending = (left: number, right: number): number => left - right;

describe("BinaryMinHeap", () => {
  test("is empty initially", () => {
    const heap = new BinaryMinHeap(ascending);

    assert.equal(heap.size, 0);
    assert.equal(heap.peek(), undefined);
    assert.equal(heap.pop(), undefined);
  });

  test("peeks at the minimum without removing it", () => {
    const heap = new BinaryMinHeap(ascending);

    heap.push(3);
    heap.push(1);
    heap.push(2);

    assert.equal(heap.peek(), 1);
    assert.equal(heap.peek(), 1);
    assert.equal(heap.size, 3);
  });

  test("pops values in ascending order regardless of insertion order", () => {
    const heap = new BinaryMinHeap(ascending);

    for (const value of [5, 2, 4, 1, 3]) {
      heap.push(value);
    }

    assert.deepEqual(
      Array.from({ length: 5 }, () => heap.pop()),
      [1, 2, 3, 4, 5],
    );
    assert.equal(heap.size, 0);
    assert.equal(heap.pop(), undefined);
  });

  test("preserves duplicate values", () => {
    const heap = new BinaryMinHeap(ascending);

    heap.push(2);
    heap.push(1);
    heap.push(2);
    heap.push(1);

    assert.deepEqual(
      [heap.pop(), heap.pop(), heap.pop(), heap.pop()],
      [1, 1, 2, 2],
    );
  });

  test("orders objects using the supplied comparator", () => {
    type Entry = { state: string; priority: number };
    const heap = new BinaryMinHeap<Entry>(
      (left, right) => left.priority - right.priority,
    );

    heap.push({ state: "expensive", priority: 8 });
    heap.push({ state: "cheapest", priority: 2 });
    heap.push({ state: "middle", priority: 5 });

    assert.deepEqual(heap.pop(), { state: "cheapest", priority: 2 });
    assert.deepEqual(heap.pop(), { state: "middle", priority: 5 });
    assert.deepEqual(heap.pop(), { state: "expensive", priority: 8 });
  });
});
