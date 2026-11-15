import { BinaryMinHeap } from "../binary-min-heap";

export type Edge<State> = {
  state: State;
  cost: number;
};

export type SearchResult<State> = {
  cost: number;
  path: State[];
  explored: number;
};

type Frame<State> = {
  state: State;
  cost: number;
  path: Map<string, State>;
};

export function aStar<State>(
  start: State,
  isGoal: (state: State) => boolean,
  neighbors: (state: State) => Edge<State>[],
  heuristic: (state: State) => number,
  keyOf: (state: State) => string,
): SearchResult<State> | null {
  let explored = 0;

  const mins = new Map<string, number>();

  const traversing = new BinaryMinHeap<Frame<State>>(
    (left, right) =>
      left.cost + heuristic(left.state) - (right.cost + heuristic(right.state)),
  );

  traversing.push({ state: start, cost: 0, path: new Map() });

  while (traversing.size > 0) {
    const frame = traversing.pop()!;

    const min = mins.get(keyOf(frame.state));

    if (min === undefined || frame.cost < min) {
      mins.set(keyOf(frame.state), frame.cost);
    } else {
      continue;
    }

    explored += 1;

    if (isGoal(frame.state)) {
      return {
        explored,
        cost: frame.cost,
        path: [...frame.path.values(), frame.state],
      };
    } else {
      neighbors(frame.state).forEach((it) => {
        const cost = it.cost + frame.cost;

        if (frame.path.has(keyOf(it.state))) {
          return;
        }

        const path = new Map(frame.path);

        path.set(keyOf(frame.state), frame.state);

        traversing.push({
          state: it.state,
          cost: cost,
          path,
        });
      });
    }
  }

  return null;
}
