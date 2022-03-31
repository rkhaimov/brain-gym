type Mouse = {
  color: 'green' | 'yellow';
  condition: 'skinny' | 'fat';
};

const mouses: Mouse[] = [
  { color: 'green', condition: 'fat' },
  { color: 'green', condition: 'fat' },
  { color: 'green', condition: 'fat' },
  { color: 'green', condition: 'skinny' },
  { color: 'yellow', condition: 'skinny' },
  { color: 'yellow', condition: 'skinny' },
  { color: 'yellow', condition: 'skinny' },
  { color: 'yellow', condition: 'skinny' },
  { color: 'yellow', condition: 'fat' },
];

type DecisionTree = DecisionLeaf | DecisionNode;

type DecisionLeaf = {
  tag: 'leaf';
  predictions: Map<Mouse['condition'], number>;
};

type DecisionNode = {
  tag: 'node';
  paths: Map<Mouse['color'], DecisionTree>;
};

console.log(predict({ color: 'green' }, grow(mouses)));

function predict(
  mouse: Omit<Mouse, 'condition'>,
  tree: DecisionTree
): DecisionLeaf['predictions'] {
  if (tree.tag === 'leaf') {
    return tree.predictions;
  }

  return predict(mouse, tree.paths.get(mouse.color)!);
}

function grow(mouses: Mouse[]): DecisionTree {
  if (hasFinalDecision(mouses)) {
    return {
      tag: 'leaf',
      predictions: getPredictions(mouses),
    };
  }

  const property = nextProperty(mouses);

  return {
    tag: 'node',
    paths: map(partitionBy(property, mouses), (subject) => grow(subject)),
  };
}

function hasFinalDecision(mouses: Mouse[]): boolean {
  if (mouses.length === 0) {
    return true;
  }

  const sample = mouses[0];

  return mouses.every((mouse) => mouse.color === sample.color);
}

function getPredictions(mouses: Mouse[]): DecisionLeaf['predictions'] {
  return map(
    partitionBy('condition', mouses),
    (group) => group.length / mouses.length
  );
}

function nextProperty(mouses: Mouse[]): 'color' {
  return 'color';
}

function partitionBy<TKey extends keyof Mouse>(
  key: TKey,
  mouses: Mouse[]
): Map<Mouse[TKey], Mouse[]> {
  const result: Map<Mouse[TKey], Mouse[]> = new Map();

  mouses.forEach((mouse) => {
    if (result.has(mouse[key]) === false) {
      result.set(mouse[key], []);
    }

    result.get(mouse[key])!.push(mouse);
  });

  return result;
}

function map<TKey, TA, TB>(
  collection: Map<TKey, TA>,
  transform: (a: TA) => TB
): Map<TKey, TB> {
  const result = new Map<TKey, TB>();

  collection.forEach((value, key) => result.set(key, transform(value)));

  return result;
}
