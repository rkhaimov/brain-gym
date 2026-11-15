import { aStar, type Edge, type SearchResult } from "./a-star";

const result = search(
  {
    start: [
      { state: "a", cost: 1 },
      { state: "b", cost: 2 },
    ],
    a: [{ state: "shared", cost: 10 }],
    b: [{ state: "shared", cost: 1 }],
    shared: [{ state: "goal", cost: 100 }],
  },
  "start",
  "goal",
);

console.log(result);

type Graph = Partial<Record<string, Edge<string>[]>>;

function search(
  graph: Graph,
  start: string,
  goal: string,
  heuristic: (state: string) => number = () => 0,
): SearchResult<string> | null {
  return aStar(
    start,
    (state) => state === goal,
    (state) => graph[state] ?? [],
    heuristic,
    (state) => state,
  );
}
