# A* search

Implement generic A* search over a graph whose states and edges are provided by
callbacks.

For every state, track:

- `g`: the cheapest cost discovered from the start to that state.
- `h`: the estimated remaining cost returned by `heuristic`.
- `f = g + h`: the priority used by the frontier heap.

`neighbors` must return non-negative edge costs. `keyOf` identifies equivalent
states. The returned path includes both the start and goal states, while
`explored` counts states removed from the frontier and accepted as their current
best entry, including the goal.

Begin with a heuristic that always returns `0`; this makes A* behave as
Dijkstra's algorithm. A later admissible heuristic may reduce the number of
explored states without changing the optimal result.

Use the binary min-heap as the frontier. A decrease-key operation is not
required: insert a new frontier entry when a cheaper route is found and ignore
stale entries when they are removed.
