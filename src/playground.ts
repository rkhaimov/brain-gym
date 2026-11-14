import { BinaryMinHeap } from "./binary-min-heap";

const ascending = (left: number, right: number): number => left - right;

const heap = new BinaryMinHeap(ascending);

for (const value of [5, 2, 4, 1, 3]) {
  heap.push(value);
}

console.log(Array.from({ length: 5 }, () => heap.pop()));
