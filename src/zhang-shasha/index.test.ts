import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { type TreeEditCosts, treeEditDistance, type TreeNode } from "./index";

function node<T>(value: T, children: TreeNode<T>[] = []): TreeNode<T> {
  return { value, children };
}

const unitCosts: TreeEditCosts<string> = {
  insert: () => 1,
  delete: () => 1,
  replace: (left, right) => (left === right ? 0 : 1),
};

describe("treeEditDistance", () => {
  test("handles empty trees and whole-tree insertion or deletion", () => {
    const tree = node("root", [node("child")]);

    assert.equal(treeEditDistance(null, null, unitCosts), 0);
    assert.equal(
      treeEditDistance(null, tree, {
        insert: () => 1,
        delete: () => 10,
        replace: () => 1,
      }),
      2,
    );
    assert.equal(
      treeEditDistance(tree, null, {
        insert: () => 10,
        delete: () => 1,
        replace: () => 1,
      }),
      2,
    );
  });

  test("chooses the cheapest operation for single-node trees", () => {
    assert.equal(treeEditDistance(node("same"), node("same"), unitCosts), 0);
    assert.equal(
      treeEditDistance(node("left"), node("right"), {
        insert: () => 10,
        delete: () => 10,
        replace: () => 4,
      }),
      4,
    );
    assert.equal(
      treeEditDistance(node("left"), node("right"), {
        insert: () => 1,
        delete: () => 1,
        replace: () => 10,
      }),
      2,
    );
  });

  test("edits descendants while preserving equal roots and sibling order", () => {
    assert.equal(
      treeEditDistance(
        node("root", [node("left-child")]),
        node("root", [node("right-child")]),
        unitCosts,
      ),
      1,
    );
    assert.equal(
      treeEditDistance(
        node("root", [node("A"), node("B")]),
        node("root", [node("B")]),
        unitCosts,
      ),
      1,
    );
  });

  test("deletes a parent while preserving and promoting its children", () => {
    const left = node("R", [node("A", [node("B"), node("C")])]);
    const right = node("R", [node("B"), node("C")]);

    assert.equal(treeEditDistance(left, right, unitCosts), 1);
  });

  test("distinguishes different structures with the same postorder values", () => {
    const left = node("R", [node("A"), node("B")]);
    const right = node("R", [node("B", [node("A")])]);

    assert.equal(treeEditDistance(left, right, unitCosts), 2);
  });
});
