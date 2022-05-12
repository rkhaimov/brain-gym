import { rewriteContainerWith } from '../container-type-node/HOTn';
import { list } from '../container-type-node/list';
import { TypeNode } from '../core';
import { toReadableErrors } from './error';
import { or } from '../or';
import { extend, rewriteRecordWith } from '../record-type-node/HOTn';
import { struct } from '../record-type-node/struct';
import { translateTo } from './translateTo';
import { biggerOrEqThan } from '../type-node/operators/biggerOrEqThan';
import { dividableBy } from '../type-node/operators/dividableBy';
import { number } from '../type-node/types/number';
import { string } from '../type-node/types/string';
import { validate } from '../validate';

test('allows to provide error message for primitives', () => {
  const tn = number().wrap(
    biggerOrEqThan(10),
    dividableBy(2),
    translateTo({
      biggerOrEqThan: (n) => `Should be greater than ${n}`,
      dividableBy: (n) => `Should be dividable by ${n}`,
    })
  );

  expect(tvalidate(tn, 2)).toMatchInlineSnapshot(`"Should be greater than 10"`);

  expect(tvalidate(tn, 13)).toMatchInlineSnapshot(`"Should be dividable by 2"`);

  const rtn = tn.wrap(
    translateTo({
      dividableBy: (n) => `Please, provide value dividable by ${n}`,
    })
  );

  expect(tvalidate(rtn, 13)).toMatchInlineSnapshot(
    `"Please, provide value dividable by 2"`
  );

  expect(tvalidate(tn.wrap(dividableBy(5)), 12)).toMatchInlineSnapshot(
    `"Should be dividable by 5"`
  );
});

test('allows to provide error message for containers', () => {
  const tn = list(string()).wrap(
    translateTo({ string: () => 'Provide a string' })
  );

  expect(tvalidate(tn, [0])).toMatchInlineSnapshot(`"[0]: Provide a string"`);

  const rtn = tn.wrap(
    translateTo({ string: () => 'Please, provide a string' })
  );

  expect(tvalidate(rtn, [0])).toMatchInlineSnapshot(
    `"[0]: Please, provide a string"`
  );
});

test('allows to provide specific error messages for container`s children', () => {
  const tn = list(string()).wrap(
    translateTo({ string: () => 'Provide a string' })
  );

  expect(tvalidate(tn, [0])).toMatchInlineSnapshot(`"[0]: Provide a string"`);

  const rtn = rewriteContainerWith(tn, (child) =>
    child.wrap(translateTo({ string: () => 'Please, provide a string' }))
  );

  expect(tvalidate(rtn, [0])).toMatchInlineSnapshot(
    `"[0]: Please, provide a string"`
  );
});

it('copies translations when extending struct', () => {
  const left = struct({ age: number(), weight: number() }).wrap(
    translateTo({ number: () => 'left' })
  );

  const right = struct({ age: number(), weight: number() }).wrap(
    translateTo({ number: () => 'right' })
  );

  expect(tvalidate(extend(left, right), {})).toMatchInlineSnapshot(`
    "age: right
    weight: right"
  `);
});

it('copies internal translations when extending struct', () => {
  const left = struct({
    age: number().wrap(translateTo({ number: () => 'left age' })),
    weight: number().wrap(translateTo({ number: () => 'left weight' })),
  });

  const right = struct({
    age: number().wrap(translateTo({ number: () => 'right age' })),
    height: number().wrap(translateTo({ number: () => 'right height' })),
  });

  expect(tvalidate(extend(left, right), {})).toMatchInlineSnapshot(`
    "age: right age
    weight: left weight
    height: right height"
  `);
});

it('external messages works like fallbacks in struct', () => {
  const tn = struct({
    age: number().wrap(translateTo({ number: () => 'Age should be a number' })),
    weight: number(),
  }).wrap(translateTo({ number: () => 'Not a number' }));

  expect(tvalidate(tn, {})).toMatchInlineSnapshot(`
    "age: Age should be a number
    weight: Not a number"
  `);
});

it('tn messages in records can be rewritten', () => {
  const tn = struct({
    age: number().wrap(translateTo({ number: () => 'Age should be a number' })),
    weight: number(),
  }).wrap(translateTo({ number: () => 'Not a number' }));

  const rtn = rewriteRecordWith(tn, {
    weight: (tn) =>
      tn.wrap(translateTo({ number: () => 'Weight should be a number' })),
  });

  expect(tvalidate(rtn, {})).toMatchInlineSnapshot(`
    "age: Age should be a number
    weight: Weight should be a number"
  `);
});

it('or persist original messages and provide fallbacks', () => {
  const left = struct({
    age: number().wrap(
      biggerOrEqThan(0),
      translateTo({ biggerOrEqThan: () => 'Age is too small' })
    ),
  });

  const right = struct({ weight: number().wrap(dividableBy(2)) });

  const tn = or(left, right).wrap(
    translateTo({
      number: () => 'Not a number',
      dividableBy: (factor) => `Should be dividable by ${factor}`,
    })
  );

  expect(tvalidate(tn, {})).toMatchInlineSnapshot(`
    "age: Not a number
    weight: Not a number"
  `);

  expect(tvalidate(tn, { weight: 3 })).toMatchInlineSnapshot(`
    "age: Not a number
    weight: Should be dividable by 2"
  `);

  expect(tvalidate(tn, { age: -3 })).toMatchInlineSnapshot(`
    "age: Age is too small
    weight: Not a number"
  `);
});

function tvalidate(tn: TypeNode, value: unknown): string {
  return toReadableErrors(validate(tn, value));
}
