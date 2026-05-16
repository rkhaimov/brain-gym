/**
 * Min heap structure
 */
type MinHeap = number[];

function left(i: number): number {
  return 2 * i + 1;
}

function right(i: number): number {
  return 2 * i + 2;
}

function p(i: number): number {
  return Math.floor((i - 1) / 2);
}

function insert(heap: MinHeap, insertion: number): MinHeap {
  let index = heap.push(insertion) - 1;

  while (index > 0) {
    const parent = heap.at(p(index));

    if (parent === undefined || parent <= insertion) {
      break;
    }

    heap[p(index)] = insertion;
    heap[index] = parent;

    index = p(index);
  }

  return heap;
}

insert([1, 9, 3], 0);
