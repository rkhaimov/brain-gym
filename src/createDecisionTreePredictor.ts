import { Either } from './either';

export function createDecisionTreePredictor<
  TSubject extends Subject,
  TTarget extends keyof TSubject
>(subjects: TSubject[], target: TTarget) {
  const tree = grow(subjects, target as string);

  return {
    predictProbability: (subject: Omit<TSubject, TTarget>) =>
      predict(subject, tree),
  };
}

type CategoryValue = string | boolean;

type Subject = Record<string, CategoryValue>;

type DecisionTree = DecisionLeaf | DecisionNode;

type DecisionLeaf = {
  tag: 'leaf';
  predictions: Map<CategoryValue, number>;
};

type DecisionNode = {
  tag: 'node';
  next(subject: Subject): DecisionTree;
};

function grow(subjects: Subject[], target: string): DecisionTree {
  return nextProperty(subjects, target)
    .map(
      (property) =>
        [
          property,
          map(partitionBy(property, subjects), (subject) =>
            grow(subject, target)
          ),
        ] as const
    )
    .fold(
      () => ({
        tag: 'leaf',
        predictions: getPredictions(subjects, target),
      }),
      ([property, table]) => ({
        tag: 'node',
        next: (subject) => table.get(subject[property])!,
      })
    );
}

function getPredictions(
  subjects: Subject[],
  target: string
): DecisionLeaf['predictions'] {
  return map(
    partitionBy(target, subjects),
    (group) => group.length / subjects.length
  );
}

function nextProperty(
  subjects: Subject[],
  target: string
): Either<string, keyof Subject> {
  const next = keys(subjects, target).find((key) =>
    hasDistinctionsOnKey(key, subjects)
  );

  if (next === undefined) {
    return Either.left('No suitable key');
  }

  return Either.right(next);
}

function hasDistinctionsOnKey(
  key: keyof Subject,
  subjects: Subject[]
): boolean {
  const parts = partitionBy(key, subjects);

  return parts.size > 1;
}

function map<TKey, TA, TB>(
  collection: Map<TKey, TA>,
  transform: (a: TA) => TB
): Map<TKey, TB> {
  const result = new Map<TKey, TB>();

  collection.forEach((value, key) => result.set(key, transform(value)));

  return result;
}

function keys(subjects: Subject[], target: string) {
  return Object.keys(subjects[0]).filter((key) => key !== target) as Array<
    keyof Subject
  >;
}

function partitionBy(key: string, subjects: Subject[]) {
  const result: Map<Subject[string], Subject[]> = new Map();

  subjects.forEach((subject) => {
    if (result.has(subject[key]) === false) {
      result.set(subject[key], []);
    }

    result.get(subject[key])!.push(subject);
  });

  return result;
}

function predict(
  subject: Subject,
  tree: DecisionTree
): DecisionLeaf['predictions'] {
  if (tree.tag === 'leaf') {
    return tree.predictions;
  }

  return predict(subject, tree.next(subject));
}
