type Tree<T> = {
  value: T;
  left?: Tree<T>;
  right?: Tree<T>;
};

// ┌──
// │
// └──

function printTree<T>(root?: Tree<T>, prefix = "", isLeft = true): void {
  if (root === undefined) {
    return;
  }

  if (root.right) {
    printTree(root.right, prefix + (isLeft ? "│   " : "    "), false);
  }

  console.log(prefix + (isLeft ? "└── " : "┌── ") + root.value);

  if (root.left) {
    printTree(root.left, prefix + (isLeft ? "    " : "│   "), true);
  }
}

const tree = {
  value: 4,
  left: {
    value: 2,
    left: { value: 1 },
    right: { value: 3 },
  },
  right: {
    value: 6,
    left: { value: 5 },
    right: { value: 7 },
  },
};

printTree(tree);
