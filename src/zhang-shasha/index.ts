export type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

export type TreeIndex<T> = {
  nodes: TreeNode<T>[];
  leftmostDescendantIndices: number[];
  keyrootIndices: number[];
};

export function indexTree<T>(root: TreeNode<T> | null): TreeIndex<T> {
  void root;

  throw new Error("Not implemented");
}
