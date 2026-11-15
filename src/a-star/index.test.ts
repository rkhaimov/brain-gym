import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { aStar, type Edge, type SearchResult } from "./index";

type Graph = Partial<Record<string, Edge<string>[]>>;

describe("aStar", () => {
  test("returns the start when it is already the goal", () => {
    const result = search({}, "start", "start");

    assert.deepEqual(result, {
      cost: 0,
      path: ["start"],
      explored: 1,
    });
  });

  test("finds a directly connected goal", () => {
    const result = search(
      {
        start: [{ state: "goal", cost: 4 }],
      },
      "start",
      "goal",
    );

    assert.deepEqual(result, {
      cost: 4,
      path: ["start", "goal"],
      explored: 2,
    });
  });

  test("returns the cheapest path rather than the path with fewest edges", () => {
    const result = search(
      {
        start: [
          { state: "goal", cost: 10 },
          { state: "a", cost: 1 },
        ],
        a: [{ state: "b", cost: 2 }],
        b: [{ state: "goal", cost: 3 }],
      },
      "start",
      "goal",
    );

    assert.deepEqual(result, {
      cost: 6,
      path: ["start", "a", "b", "goal"],
      explored: 4,
    });
  });

  test("uses the heuristic to avoid exploring less promising states", () => {
    const heuristic: Record<string, number> = {
      start: 3,
      expensive: 10,
      cheap: 2,
      almostThere: 1,
      goal: 0,
    };

    const result = search(
      {
        start: [
          { state: "expensive", cost: 0.5 },
          { state: "cheap", cost: 1 },
        ],
        expensive: [{ state: "goal", cost: 10 }],
        cheap: [{ state: "almostThere", cost: 1 }],
        almostThere: [{ state: "goal", cost: 1 }],
      },
      "start",
      "goal",
      (state) => heuristic[state],
    );

    assert.deepEqual(result, {
      cost: 3,
      path: ["start", "cheap", "almostThere", "goal"],
      explored: 4,
    });
  });

  test("reopens a state when a cheaper route is discovered later", () => {
    const heuristic: Record<string, number> = {
      start: 11.5,
      a: 0,
      b: 10.5,
      goal: 0,
    };

    const result = search(
      {
        start: [
          { state: "a", cost: 2 },
          { state: "b", cost: 1 },
        ],
        a: [{ state: "goal", cost: 10 }],
        b: [{ state: "a", cost: 0.5 }],
      },
      "start",
      "goal",
      (state) => heuristic[state],
    );

    assert.equal(result?.cost, 11.5);
    assert.deepEqual(result?.path, ["start", "b", "a", "goal"]);
  });

  test("does not explore a more expensive entry for the same state", () => {
    const result = search(
      {
        start: [
          { state: "a", cost: 0.5 },
          { state: "b", cost: 2 },
        ],
        a: [{ state: "shared", cost: 0.5 }],
        b: [{ state: "shared", cost: 10 }],
        shared: [{ state: "goal", cost: 100 }],
      },
      "start",
      "goal",
    );

    assert.deepEqual(result, {
      cost: 101,
      path: ["start", "a", "shared", "goal"],
      explored: 5,
    });
  });

  test("ignores an expensive entry superseded after it was enqueued", () => {
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

    assert.deepEqual(result, {
      cost: 103,
      path: ["start", "b", "shared", "goal"],
      explored: 5,
    });
  });

  test("returns null when cycles do not lead to a goal", () => {
    const result = search(
      {
        start: [{ state: "a", cost: 1 }],
        a: [{ state: "start", cost: 1 }],
      },
      "start",
      "goal",
    );

    assert.equal(result, null);
  });
});

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
