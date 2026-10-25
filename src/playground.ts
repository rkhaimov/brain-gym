import { treeEditDistance, type TreeNode } from "./zhang-shasha";

function node(
  value: string,
  children: TreeNode<string>[] = [],
): TreeNode<string> {
  return { value, children };
}

const left = node("R", [node("A", [node("B"), node("C")])]);
const right = node("R", [node("B"), node("C")]);


console.log(
  treeEditDistance(left, right, {
    insert: () => 1,
    delete: () => 1,
    replace: (leftValue, rightValue) => (leftValue === rightValue ? 0 : 1),
  }),
);
