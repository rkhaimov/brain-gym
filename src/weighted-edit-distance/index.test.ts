import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { type EditCosts, weightedEditDistance } from "./index";

const unitCosts: EditCosts<string> = {
  insert: () => 1,
  delete: () => 1,
  replace: () => 1,
};

describe("weightedEditDistance", () => {
  test("returns zero cost and no edits for two empty sequences", () => {
    assert.deepEqual(weightedEditDistance([], [], unitCosts), {
      cost: 0,
      edits: [],
    });
  });

  test("keeps equal values without adding cost", () => {
    assert.deepEqual(weightedEditDistance(["A"], ["A"], unitCosts), {
      cost: 0,
      edits: [
        {
          type: "keep",
          sourceIndex: 0,
          targetIndex: 0,
          value: "A",
        },
      ],
    });
  });

  test("accumulates value-dependent insertion costs", () => {
    const costs: EditCosts<string> = {
      ...unitCosts,
      insert: (value) => value.length,
    };

    assert.deepEqual(weightedEditDistance([], ["A", "BB"], costs), {
      cost: 3,
      edits: [
        { type: "insert", index: 0, value: "A" },
        { type: "insert", index: 1, value: "BB" },
      ],
    });
  });

  test("accumulates value-dependent deletion costs", () => {
    const costs: EditCosts<string> = {
      ...unitCosts,
      delete: (value) => value.length,
    };

    assert.deepEqual(weightedEditDistance(["A", "BB"], [], costs), {
      cost: 3,
      edits: [
        { type: "delete", index: 0, value: "A" },
        { type: "delete", index: 0, value: "BB" },
      ],
    });
  });

  test("uses the configured replacement cost", () => {
    const costs: EditCosts<string> = {
      ...unitCosts,
      replace: () => 0.5,
    };

    assert.deepEqual(weightedEditDistance(["A"], ["B"], costs), {
      cost: 0.5,
      edits: [{ type: "replace", index: 0, oldValue: "A", newValue: "B" }],
    });
  });

  test("uses deletion and insertion when replacement is more expensive", () => {
    const costs: EditCosts<string> = {
      insert: () => 1,
      delete: () => 1,
      replace: () => 10,
    };

    assert.deepEqual(weightedEditDistance(["A"], ["B"], costs), {
      cost: 2,
      edits: [
        { type: "delete", index: 0, value: "A" },
        { type: "insert", index: 0, value: "B" },
      ],
    });
  });

  test("chooses operations using the total remaining weighted cost", () => {
    const costs: EditCosts<string> = {
      insert: (value) => (value === "B" ? 1 : 5),
      delete: () => 4,
      replace: () => 3,
    };

    assert.deepEqual(weightedEditDistance(["A", "A"], ["B", "A", "A"], costs), {
      cost: 1,
      edits: [
        { type: "insert", index: 0, value: "B" },
        {
          type: "keep",
          sourceIndex: 0,
          targetIndex: 1,
          value: "A",
        },
        {
          type: "keep",
          sourceIndex: 1,
          targetIndex: 2,
          value: "A",
        },
      ],
    });
  });

  test("uses suffix costs when operation costs differ by value", () => {
    const costs: EditCosts<string> = {
      insert: () => 100,
      delete: (value) => (value === "A" ? 1 : 100),
      replace: () => 1,
    };

    assert.deepEqual(weightedEditDistance(["A", "XX"], ["B"], costs), {
      cost: 2,
      edits: [
        { type: "delete", index: 0, value: "A" },
        { type: "replace", index: 0, oldValue: "XX", newValue: "B" },
      ],
    });
  });
});
