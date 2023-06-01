function createProgrammingCat(): Category {
  return [
    {
      id: createObjectId('never'),
      morphisms: [
        createObjectId('void'),
        createObjectId('bool'),
        createObjectId('string'),
        createObjectId('number'),
        createObjectId('true'),
        createObjectId('"Hello world"'),
        createObjectId('42'),
      ],
    },
    {
      id: createObjectId('void'),
      morphisms: [
        createObjectId('true'),
        createObjectId('"Hello world"'),
        createObjectId('42'),
      ],
    },
    { id: createObjectId('bool'), morphisms: [] },
    {
      id: createObjectId('string'),
      morphisms: [createObjectId('number')],
    },
    {
      id: createObjectId('number'),
      morphisms: [createObjectId('string')],
    },
    // Literal types here
    {
      id: createObjectId('true'),
      morphisms: [createObjectId('bool')],
    },
    {
      id: createObjectId('"Hello world"'),
      morphisms: [createObjectId('string')],
    },
    {
      id: createObjectId('42'),
      morphisms: [createObjectId('number')],
    },
  ];
}

function placeIdentityMorphisms(cat: Category): Category {
  return cat.map((it) => ({ ...it, morphisms: [it.id, ...it.morphisms] }));
}

console.log(findInitialObject(placeIdentityMorphisms(createProgrammingCat()))?.id);

type CategoryObjectId = string & { __brand: 'CategoryObjectId' };

type CategoryObject = {
  id: CategoryObjectId;
  morphisms: CategoryObjectId[];
};

type Category = CategoryObject[];

function createObjectId(name: string) {
  return name as CategoryObjectId;
}

function findInitialObject(cat: Category): CategoryObject | null {
  if (cat.length === 0) {
    return null;
  }

  if (cat.length === 1) {
    const single = cat[0];

    return selectInitialObject(single, single);
  }

  const [first, second, ...tail] = cat;

  const initial = selectInitialObject(first, second);

  // It means that neither first nor second are initial objects, so we continue searching deeper
  if (initial === null) {
    return findInitialObject(tail);
  }

  return findInitialObject([initial, ...tail]);
}

function selectInitialObject(
  left: CategoryObject,
  right: CategoryObject
): CategoryObject | null {
  // We are in a cycle
  if (left.morphisms.includes(right.id) && right.morphisms.includes(left.id) && left.id !== right.id) {
    return null;
  }

  // By definition: Initial object has one and only one morphism to any object in the category
  if (left.morphisms.filter((it) => it === right.id).length === 1) {
    return left;
  }

  if (right.morphisms.filter((it) => it === left.id).length === 1) {
    return right;
  }

  return null;
}
