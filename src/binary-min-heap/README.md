# Binary min-heap

Implement a priority queue backed by a binary min-heap. The comparator returns a
negative number when its left value has higher priority than its right value.

The public operations are:

- `push(value)` inserts a value.
- `peek()` returns the minimum value without removing it.
- `pop()` removes and returns the minimum value.
- `size` reports the number of stored values.

Keep insertion and removal at `O(log n)`, and inspection of the minimum at
`O(1)`. This priority queue will later hold the frontier explored by A*.
