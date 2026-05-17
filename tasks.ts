// tree
// graph
// bloom filter
// segment tree

type Tree = {
  value: number;
  left?: Tree;
  right?: Tree;
};

function maxDepth(tree: Tree | undefined): number {
  if (tree === undefined) {
    return 0;
  }

  return 1 + Math.max(maxDepth(tree.left), maxDepth(tree.right));
}

function maxDepthIter(tree: Tree | undefined) {
  let depth = 0;
  let max = 0;
  let curr = tree;
  const stack: Tree[] = [];
  while (curr || stack.length > 0) {
    while (curr) {
      depth += 1;

      stack.push(curr);

      curr = curr.left;
    }

    max = Math.max(max, depth);

    const node = stack.pop()!;

    if (node.right === undefined) {
      depth -= 1;
    }

    curr = node.right;
  }

  return max;
}

console.log(
  maxDepthIter({
    value: 1,
    left: { value: 2 },
    right: { value: 3, left: { value: 6 } },
  }),
);
