export type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

type Frame<T> = {
  node: TreeNode<T>;
  childHashes: string[];
};

export function hashSubtrees<T>(
  root: TreeNode<T>,
  hashNode: (value: T, childHashes: readonly string[]) => string,
): Map<TreeNode<T>, string> {
  const result: Map<TreeNode<T>, string> = new Map();

  const stack: Frame<T>[] = [{ node: root, childHashes: [] }];

  while (stack.length > 0) {
    const frame = stack.at(-1)!;
    const child = frame.node.children.at(frame.childHashes.length);

    if (child === undefined) {
      stack.pop();

      const hash = hashNode(frame.node.value, frame.childHashes);
      result.set(frame.node, hash);

      const parent = stack.at(-1);
      parent?.childHashes.push(hash);
    } else {
      stack.push({ node: child, childHashes: [] });
    }
  }

  return result;
}
