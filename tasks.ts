type NodeID = number;

type NodeEntry = { id: NodeID; children: NodeID[] };

type Tree = {
  id: NodeID;
  children: Tree[];
};

/**
 * Builds tree from linked list. Detects multiple or none roots and cycles
 */
function createTreeFromList(all: NodeEntry[]): Tree {
  const roots = findRoots(all);

  if (roots.length !== 1) {
    throw new Error("Root must be single");
  }

  return createTreeFromRoot(
    roots[0],
    new Map(all.map((it) => [it.id, it] as const)),
    new Set(),
  );
}

function findRoots(all: NodeEntry[]): NodeEntry[] {
  const children = new Set(all.flatMap((node) => node.children));

  return all.filter((node) => !children.has(node.id));
}

function createTreeFromRoot(
  root: NodeEntry,
  all: Map<NodeID, NodeEntry>,
  visited: Set<NodeID>,
): Tree {
  if (visited.has(root.id)) {
    throw new Error("Cycles are prohibited");
  }

  visited.add(root.id);

  return {
    id: root.id,
    children: root.children
      .map((child) => all.get(child))
      .map(assertExists)
      .map((child) => createTreeFromRoot(child, all, visited)),
  };

  function assertExists(node: NodeEntry | undefined): NodeEntry {
    if (node === undefined) {
      throw new Error("All children must be defined");
    }

    return node;
  }
}

console.log(
  JSON.stringify(
    createTreeFromList([
      { id: 1, children: [2] },
      { id: 2, children: [] },
      { id: 2, children: [] },
    ]),
    null,
    2,
  ),
);
