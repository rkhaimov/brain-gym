import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { indexTree, type TreeNode } from "./index";

function node<T>(value: T, children: TreeNode<T>[] = []): TreeNode<T> {
  return { value, children };
}

describe("indexTree", () => {
  test("indexes an empty tree", () => {
    assert.deepEqual(indexTree(null), {
      nodes: [],
      leftmostDescendantIndices: [],
      keyrootIndices: [],
    });
  });

  test("indexes a single node", () => {
    const root = node("root");

    assert.deepEqual(indexTree(root), {
      nodes: [root],
      leftmostDescendantIndices: [0],
      keyrootIndices: [0],
    });
  });

  test("indexes a linear tree in postorder", () => {
    const leaf = node("leaf");
    const child = node("child", [leaf]);
    const root = node("root", [child]);

    assert.deepEqual(indexTree(root), {
      nodes: [leaf, child, root],
      leftmostDescendantIndices: [0, 0, 0],
      keyrootIndices: [2],
    });
  });

  test("indexes sibling subtrees from left to right", () => {
    const left = node("left");
    const right = node("right");
    const root = node("root", [left, right]);

    assert.deepEqual(indexTree(root), {
      nodes: [left, right, root],
      leftmostDescendantIndices: [0, 1, 0],
      keyrootIndices: [1, 2],
    });
  });

  test("indexes an asymmetric branching tree", () => {
    const d = node("d");
    const g = node("g");
    const e = node("e", [g]);
    const b = node("b", [d, e]);
    const f = node("f");
    const c = node("c", [f]);
    const a = node("a", [b, c]);

    assert.deepEqual(indexTree(a), {
      nodes: [d, g, e, b, f, c, a],
      leftmostDescendantIndices: [0, 1, 1, 0, 4, 4, 0],
      keyrootIndices: [2, 5, 6],
    });
  });

  test("indexes distinct nodes that have equal values", () => {
    const left = node("same");
    const right = node("same");
    const root = node("same", [left, right]);

    assert.deepEqual(indexTree(root), {
      nodes: [left, right, root],
      leftmostDescendantIndices: [0, 1, 0],
      keyrootIndices: [1, 2],
    });
  });
});
