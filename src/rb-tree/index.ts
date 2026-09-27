export type RBTreeState = null | {
  weight: number;
  color: "red" | "black";
  left: RBTreeState;
  right: RBTreeState;
  parent: RBTreeState;
};

type RBNode = NonNullable<RBTreeState>;

export class RBTree {
  private state: RBTreeState = null;

  static from(state: RBTreeState): RBTree {
    validate(state);

    const tree = new RBTree();
    tree.state = state;

    return tree;

    function validate(root: RBTreeState): void {
      if (root?.color === "red") {
        throw new Error("root is not black");
      }

      type Frame = [
        node: RBTreeState,
        parent: RBTreeState,
        blackCount: number,
        min: number | null,
        max: number | null,
      ];

      let expectedBlackCount: number | null = null;
      const stack: Frame[] = [[root, null, 0, null, null]];

      while (stack.length) {
        const [node, parent, blackCount, min, max] = stack.pop()!;

        if (!node) {
          expectedBlackCount ??= blackCount;
          if (expectedBlackCount !== blackCount) {
            throw new Error("black node counts do not match");
          }

          continue;
        }

        if (node.parent !== parent) {
          throw new Error("parent pointer is invalid");
        }

        if (
          Number.isNaN(node.weight) ||
          (min !== null && node.weight <= min) ||
          (max !== null && node.weight >= max)
        ) {
          throw new Error("bst ordering is invalid");
        }

        if (node.color === "red" && parent?.color === "red") {
          throw new Error("red is a child of red");
        }

        const nextBlackCount =
          node.color === "black" ? blackCount + 1 : blackCount;

        stack.push(
          [node.right, node, nextBlackCount, node.weight, max],
          [node.left, node, nextBlackCount, min, node.weight],
        );
      }
    }
  }

  insert(target: number) {
    this.state = insert(this.state, target);
  }

  has(target: number): boolean {
    let curr = this.state;

    while (curr) {
      if (curr.weight === target) {
        return true;
      }

      curr = target > curr.weight ? curr.right : curr.left;
    }

    return false;
  }

  count(min: number, max: number): number {
    let count = 0;
    const stack = [this.state];

    while (stack.length) {
      const curr = stack.pop();

      if (!curr) {
        continue;
      }

      if (curr.weight >= min && curr.weight <= max) {
        count += 1;
      }

      if (curr.weight < max) {
        stack.push(curr.right);
      }

      if (curr.weight > min) {
        stack.push(curr.left);
      }
    }

    return count;
  }

  print(): string {
    return JSON.stringify(_toPrintable(this.state), null, 2);

    function _toPrintable(tree: RBTreeState): unknown {
      if (tree === null) {
        return null;
      }

      return {
        pw: tree.parent?.weight,
        color: tree.color,
        weight: tree.weight,
        left: _toPrintable(tree.left),
        right: _toPrintable(tree.right),
      };
    }
  }
}

function insert(tree: RBTreeState, target: number): RBTreeState {
  let parent: RBTreeState = null;
  let current = tree;

  while (current) {
    if (target === current.weight) {
      return tree;
    }

    parent = current;
    current = target > current.weight ? current.right : current.left;
  }

  const inserted: RBNode = {
    parent,
    weight: target,
    color: "red",
    left: null,
    right: null,
  };

  if (parent) {
    parent[target > parent.weight ? "right" : "left"] = inserted;
  }

  return repair(inserted);
}

function repair(inserted: RBNode): RBNode {
  let curr = inserted;

  while (curr.color === "red" && curr.parent?.color === "red") {
    const parent = curr.parent;
    const grand = parent.parent!;

    const uncle = grand.left === parent ? grand.right : grand.left;

    if (uncle?.color === "red") {
      // Repaint case
      //    G
      //   / \
      // U R  P R
      //       \
      //       C R

      uncle.color = "black";
      parent.color = "black";
      grand.color = "red";

      curr = grand;

      continue;
    }

    if (curr === parent.left && parent === grand.right) {
      // zig-zag
      // G
      //  \
      //   P
      //  /
      // C
      grand.color = "red";
      curr.color = "black";

      curr = lrotate(rrotate(curr));
    } else if (curr === parent.right && parent === grand.left) {
      // zig-zag
      //    G
      //   /
      //  P
      //   \
      //    C
      grand.color = "red";
      curr.color = "black";

      curr = rrotate(lrotate(curr));
    } else if (parent === grand.right) {
      // left rotate
      //    G
      //     \
      //     P R
      //       \
      //       C R
      grand.color = "red";
      parent.color = "black";

      curr = lrotate(parent);
    } else {
      // right rotate
      //    G
      //   /
      //  P R
      //  /
      // C R
      grand.color = "red";
      parent.color = "black";

      curr = rrotate(parent);
    }
  }

  // Walk up to root
  while (curr.parent) {
    curr = curr.parent;
  }

  // Root is always black
  curr.color = "black";

  return curr;
}

function lrotate(child: RBNode): RBNode {
  const parent = child.parent!;
  const grand = parent.parent;

  child.parent = grand;
  if (grand) {
    if (grand.left === parent) {
      grand.left = child;
    } else {
      grand.right = child;
    }
  }

  parent.right = child.left;
  if (child.left) {
    child.left.parent = parent;
  }

  child.left = parent;
  parent.parent = child;

  return child;
}

function rrotate(child: RBNode): RBNode {
  const parent = child.parent!;
  const grand = parent.parent;

  child.parent = grand;
  if (grand) {
    if (grand.left === parent) {
      grand.left = child;
    } else {
      grand.right = child;
    }
  }

  parent.left = child.right;
  if (child.right) {
    child.right.parent = parent;
  }

  child.right = parent;
  parent.parent = child;

  return child;
}
