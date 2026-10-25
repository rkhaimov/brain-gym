export type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

export type TreeEditCosts<T> = {
  insert: (value: T) => number;
  delete: (value: T) => number;
  replace: (left: T, right: T) => number;
};

type SubtreeIterable<T> = {
  length: number;
  globalIndex(gridIndex: number): number;
  isTree(gridIndex: number): boolean;
  lmd(gridIndex: number): number;
  gridIndexAtOwnLmd(gridIndex: number): number;
  prevLmdSiblingGridIndex(gridIndex: number): number;
};

export function treeEditDistance<T>(
  left: TreeNode<T> | null,
  right: TreeNode<T> | null,
  editCosts: TreeEditCosts<T>,
): number {
  const leftIndexTree = indexTree(left);
  const rightIndexTree = indexTree(right);

  const lmdPairToCosts = new Map<string, number[][]>();

  for (const leftKeyroot of leftIndexTree.keyrootIndices) {
    for (const rightKeyoot of rightIndexTree.keyrootIndices) {
      fillLocalCostGrid(leftKeyroot, rightKeyoot);
    }
  }

  const result = lmdPairToCosts.get(
    `${leftIndexTree.leftmostDescendantIndices[leftIndexTree.keyrootIndices.at(-1)!]},${rightIndexTree.leftmostDescendantIndices[rightIndexTree.keyrootIndices.at(-1)!]}`,
  );

  if (result === undefined) {
    return (
      leftIndexTree.nodes.reduce(
        (total, node) => total + editCosts.delete(node.value),
        0,
      ) +
      rightIndexTree.nodes.reduce(
        (total, node) => total + editCosts.insert(node.value),
        0,
      )
    );
  }

  return result.at(-1)!.at(-1)!;

  function fillLocalCostGrid(leftKeyroot: number, rightKeyroot: number) {
    const leftSubtree = createSubtreeIterable(leftIndexTree, leftKeyroot);
    const rightSubtree = createSubtreeIterable(rightIndexTree, rightKeyroot);

    const localCostGrid = createCostGrid(leftSubtree, rightSubtree);

    lmdPairToCosts.set(
      `${leftIndexTree.leftmostDescendantIndices[leftKeyroot]},${rightIndexTree.leftmostDescendantIndices[rightKeyroot]}`,
      localCostGrid,
    );

    for (
      let leftGridIndex = 1;
      leftGridIndex < localCostGrid.length;
      leftGridIndex++
    ) {
      for (
        let rightGridIndex = 1;
        rightGridIndex < localCostGrid[leftGridIndex].length;
        rightGridIndex++
      ) {
        const leftNodeValue =
          leftIndexTree.nodes[leftSubtree.globalIndex(leftGridIndex)].value;
        const rightNodeValue =
          rightIndexTree.nodes[rightSubtree.globalIndex(rightGridIndex)].value;

        if (
          leftSubtree.isTree(leftGridIndex) &&
          rightSubtree.isTree(rightGridIndex)
        ) {
          /* comparing trees */
          const replaced =
            localCostGrid[leftGridIndex - 1][rightGridIndex - 1] +
            editCosts.replace(leftNodeValue, rightNodeValue);

          const deleted =
            localCostGrid[leftGridIndex - 1][rightGridIndex] +
            editCosts.delete(leftNodeValue);

          const inserted =
            localCostGrid[leftGridIndex][rightGridIndex - 1] +
            editCosts.insert(rightNodeValue);

          localCostGrid[leftGridIndex][rightGridIndex] = Math.min(
            replaced,
            deleted,
            inserted,
          );
        } else {
          /* comparing forests */
          const matched =
            lmdPairToCosts.get(
              `${leftSubtree.lmd(leftGridIndex)},${rightSubtree.lmd(rightGridIndex)}`,
            )![leftSubtree.gridIndexAtOwnLmd(leftGridIndex)][
              rightSubtree.gridIndexAtOwnLmd(rightGridIndex)
            ] +
            localCostGrid[leftSubtree.prevLmdSiblingGridIndex(leftGridIndex)][
              rightSubtree.prevLmdSiblingGridIndex(rightGridIndex)
            ];

          const deleted =
            localCostGrid[leftGridIndex - 1][rightGridIndex] +
            editCosts.delete(leftNodeValue);

          const inserted =
            localCostGrid[leftGridIndex][rightGridIndex - 1] +
            editCosts.insert(rightNodeValue);

          localCostGrid[leftGridIndex][rightGridIndex] = Math.min(
            matched,
            deleted,
            inserted,
          );
        }
      }
    }
  }

  function createCostGrid(
    leftSubtree: SubtreeIterable<T>,
    rightSubtree: SubtreeIterable<T>,
  ): number[][] {
    const costs: number[][] = Array.from(
      { length: leftSubtree.length + 1 },
      () => Array.from({ length: rightSubtree.length + 1 }, () => 0),
    );

    for (let index = 1; index < costs.length; index++) {
      costs[index][0] =
        costs[index - 1][0] +
        editCosts.delete(
          leftIndexTree.nodes[leftSubtree.globalIndex(index)].value,
        );
    }

    for (let index = 1; index < costs[0].length; index++) {
      costs[0][index] =
        costs[0][index - 1] +
        editCosts.insert(
          rightIndexTree.nodes[rightSubtree.globalIndex(index)].value,
        );
    }

    return costs;
  }

  function createSubtreeIterable(
    index: TreeIndex<T>,
    keyroot: number,
  ): SubtreeIterable<T> {
    const rootLmd = index.leftmostDescendantIndices[keyroot];

    const iterable: SubtreeIterable<T> = {
      length: keyroot - rootLmd + 1,
      globalIndex: (gridIndex) => gridIndex - 1 + rootLmd,
      lmd: (gridIndex) =>
        index.leftmostDescendantIndices[iterable.globalIndex(gridIndex)],
      isTree: (gridIndex) => rootLmd === iterable.lmd(gridIndex),
      gridIndexAtOwnLmd: (gridIndex) =>
        iterable.globalIndex(gridIndex) - iterable.lmd(gridIndex) + 1,
      prevLmdSiblingGridIndex: (gridIndex) => iterable.lmd(gridIndex) - rootLmd,
    };

    return iterable;
  }
}

type TreeIndex<T> = {
  nodes: TreeNode<T>[];
  leftmostDescendantIndices: number[];
  keyrootIndices: number[];
};

type Frame<T> = {
  node: TreeNode<T>;
  childrenLmds: number[];
};

function indexTree<T>(root: TreeNode<T> | null): TreeIndex<T> {
  if (root === null) {
    return { leftmostDescendantIndices: [], nodes: [], keyrootIndices: [] };
  }

  const result: TreeIndex<T> = {
    nodes: [],
    leftmostDescendantIndices: [],
    keyrootIndices: [],
  };

  const stack: Frame<T>[] = [{ node: root, childrenLmds: [] }];

  while (stack.length > 0) {
    const frame = stack.at(-1)!;

    if (frame.node.children.length === frame.childrenLmds.length) {
      // Flush current frame
      stack.pop();

      result.nodes.push(frame.node);

      const lmd = frame.childrenLmds[0] ?? result.nodes.length - 1;

      result.leftmostDescendantIndices.push(lmd);

      // Propagate lmd to parent
      stack.at(-1)?.childrenLmds.push(lmd);
    } else {
      stack.push({
        node: frame.node.children[frame.childrenLmds.length],
        childrenLmds: [],
      });
    }
  }

  const keyrootByLmd = new Map<number, number>();

  for (let i = 0; i < result.leftmostDescendantIndices.length; i++) {
    keyrootByLmd.set(result.leftmostDescendantIndices[i], i);
  }

  result.keyrootIndices = [...keyrootByLmd.values()].sort((a, b) => a - b);

  return result;
}
