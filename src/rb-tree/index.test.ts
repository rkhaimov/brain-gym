import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { RBTree, type RBTreeState } from "./index";

describe("RBTree.from", () => {
  test("creates a tree from valid external state", () => {
    const root = node(4, "black");
    root.left = node(2, "red", root);
    root.right = node(6, "red", root);

    const tree = RBTree.from(root);

    assert.equal(tree.has(2), true);
    assert.equal(tree.has(3), false);
  });

  test("creates an empty tree from null state", () => {
    const tree = RBTree.from(null);

    assert.equal(tree.has(1), false);
  });

  test("rejects a red root", () => {
    const root = node(4, "red");

    assert.throws(() => RBTree.from(root), { message: "root is not black" });
  });

  test("rejects nodes that violate BST ordering", () => {
    const root = node(10, "black");
    root.left = node(5, "black", root);
    root.right = node(15, "black", root);
    root.left.right = node(12, "red", root.left);

    assert.throws(() => RBTree.from(root), {
      message: "bst ordering is invalid",
    });
  });

  test("rejects an incorrect parent pointer", () => {
    const root = node(4, "black");
    root.left = node(2, "black");
    root.right = node(6, "black", root);

    assert.throws(() => RBTree.from(root), {
      message: "parent pointer is invalid",
    });
  });

  test("rejects adjacent red nodes", () => {
    const root = node(4, "black");
    root.left = node(2, "red", root);
    root.left.left = node(1, "red", root.left);

    assert.throws(() => RBTree.from(root), {
      message: "red is a child of red",
    });
  });

  test("rejects unequal black heights", () => {
    const root = node(4, "black");
    root.left = node(2, "black", root);

    assert.throws(() => RBTree.from(root), {
      message: "black node counts do not match",
    });
  });
});

describe("RBTree.insert", () => {
  test("inserts searchable weights", () => {
    const tree = new RBTree();
    const weights = [4, 2, 6, 1, 3, 5, 7];

    for (const weight of weights) {
      tree.insert(weight);
    }

    for (const weight of weights) {
      assert.equal(tree.has(weight), true);
    }
    assert.equal(tree.has(8), false);
  });

  test("does not insert duplicate weights", () => {
    const tree = new RBTree();

    tree.insert(4);
    tree.insert(4);
    tree.insert(4);

    assert.equal(tree.count(-Infinity, Infinity), 1);
  });

  test("preserves a valid red-black tree after every insertion", () => {
    const tree = new RBTree();
    const weights = [6, 7, 0, 1, 3, 4, 5, 2];

    for (const weight of weights) {
      tree.insert(weight);
      assert.doesNotThrow(
        () => RBTree.from(stateOf(tree)),
        `tree became invalid after inserting ${weight}`,
      );
    }
  });
});

function node(
  weight: number,
  color: "red" | "black",
  parent: RBTreeState = null,
): NonNullable<RBTreeState> {
  return { weight, color, left: null, right: null, parent };
}

function stateOf(tree: RBTree): RBTreeState {
  return (tree as unknown as { state: RBTreeState }).state;
}
