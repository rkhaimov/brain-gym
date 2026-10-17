import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { hashSubtrees, type TreeNode } from "./index";

const hashNode = (value: string, childHashes: readonly string[]) =>
  `hash:${value}(${childHashes.join(",")})`;

describe("hashSubtrees", () => {
  test("hashes a tree containing only a root", () => {
    const root: TreeNode<string> = {
      value: "root",
      children: [],
    };

    assert.deepEqual(
      hashSubtrees(root, hashNode),
      new Map([[root, "hash:root()"]]),
    );
  });

  test("includes child hashes in their parent's hash", () => {
    const left: TreeNode<string> = { value: "left", children: [] };
    const right: TreeNode<string> = { value: "right", children: [] };
    const root: TreeNode<string> = {
      value: "root",
      children: [left, right],
    };

    assert.deepEqual(
      hashSubtrees(root, hashNode),
      new Map([
        [left, "hash:left()"],
        [right, "hash:right()"],
        [root, "hash:root(hash:left(),hash:right())"],
      ]),
    );
  });

  test("propagates descendant hashes to every ancestor", () => {
    const grandchild: TreeNode<string> = {
      value: "grandchild",
      children: [],
    };
    const child: TreeNode<string> = {
      value: "child",
      children: [grandchild],
    };
    const root: TreeNode<string> = {
      value: "root",
      children: [child],
    };

    assert.deepEqual(
      hashSubtrees(root, hashNode),
      new Map([
        [grandchild, "hash:grandchild()"],
        [child, "hash:child(hash:grandchild())"],
        [root, "hash:root(hash:child(hash:grandchild()))"],
      ]),
    );
  });
});
