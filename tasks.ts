// tree
// graph
// trie
// bloom filter
// segment tree
type TrieNode = {
  children: Map<string, TrieNode>;
  isWord: boolean;
};

const ROOT = { isWord: false, children: new Map() };

const t0 = insert(ROOT, "cat");
const t1 = insert(t0, "cate");
const t2 = remove(t1, "cat");

console.log(search(t2!, "cate")); // outputs true
console.log(search(t2!, "cat")); // outputs false

function remove(root: TrieNode, word: string): TrieNode | undefined {
  const char = word.at(0);

  if (char === undefined) {
    if (root.children.size === 0) {
      return undefined;
    }

    root.isWord = false;

    return root;
  }

  const child = root.children.get(char);

  if (child === undefined) {
    return root;
  }

  const updated = remove(child, word.slice(1));

  if (updated === undefined) {
    root.children.delete(char);
  }

  if (root.children.size === 0 && !root.isWord) {
    return undefined;
  }

  return root;
}

function insert(root: TrieNode, word: string): TrieNode {
  let curr: TrieNode = root;

  for (const char of word) {
    const child = curr.children.get(char);

    if (child) {
      curr = child;

      continue;
    }

    const node: TrieNode = { children: new Map(), isWord: false };

    curr.children.set(char, node);

    curr = node;
  }

  curr.isWord = true;

  return root;
}

function search(root: TrieNode, word: string): boolean {
  return _findNodeByPrefix(root, word)?.isWord ?? false;
}

function startsWith(root: TrieNode, prefix: string): boolean {
  return _findNodeByPrefix(root, prefix) !== undefined;
}

function _findNodeByPrefix(
  root: TrieNode,
  prefix: string,
): TrieNode | undefined {
  let curr: TrieNode = root;

  for (const char of prefix) {
    const child = curr.children.get(char);

    if (child === undefined) {
      return undefined;
    }

    curr = child;
  }

  return curr;
}
