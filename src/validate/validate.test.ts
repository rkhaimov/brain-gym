import { list } from '../types/list';
import { TypeNode } from '../core';
import { or } from '../hot/or';
import { struct } from '../types/struct';
import { toFormValidationErrors, toReadableErrors } from '../translate/error';
import { brand } from '../hot/brand';
import { moreThan } from '../operators/moreThan';
import { lessThan } from '../operators/lessThan';
import { boolean } from '../types/boolean';
import { nil } from '../types/nil';
import { number } from '../types/number';
import { string } from '../types/string';
import { narrow, validate } from './index';
import { tree } from '../types/tree';
import { exact } from '../operators/exact';
import { func } from '../types/func';
import { defaults } from '../defaults';

test('validates primitives with static checking', () => {
  const tn = number();

  expectNoErrors(validate(tn, 42));
  // @ts-expect-error // Static check
  expect(validate(tn, '42').length).toMatchInlineSnapshot(`1`);
});

test('narrows in assertion like manner', () => {
  const tn = number();

  expect(narrow(tn, 42 as unknown)).toMatchInlineSnapshot(`42`);

  expect(() => narrow(tn, '42')).toThrowErrorMatchingInlineSnapshot(
    `"number: no params"`
  );
});

test('allows to add additional constraints', () => {
  const tn = number().pipe(moreThan(50));

  expect(tvalidate(tn, 20)).toMatchInlineSnapshot(`"moreThan: 50"`);

  expect(tvalidate(tn, '60')).toMatchInlineSnapshot(`"number: no params"`);

  expect(tvalidate(tn, '42')).toMatchInlineSnapshot(`"number: no params"`);

  expectNoErrors(validate(tn, 100));
});

test('primitive types can be widened', () => {
  const tn = or(number(), nil());

  expect(tvalidate(tn, '42')).toMatchInlineSnapshot(`
    "number: no params
    nil: no params"
  `);

  expectNoErrors(validate(tn, undefined));
  expectNoErrors(validate(tn, 42));
});

test('Primitive types can be narrowed', () => {
  const tn = brand(number(), 'id');

  // @ts-expect-error // Static check
  validate(tn, 42);

  const narrowed = narrow(tn, 42);

  expectNoErrors(validate(tn, narrowed));
});

test('Container types can be validated', () => {
  const tn = list(number());

  expectNoErrors(validate(tn, []));
  expectNoErrors(validate(tn, [42]));

  expect(tvalidate(tn, '42')).toMatchInlineSnapshot(`"list: no params"`);

  expect(tvalidate(tn, ['42', 42, '42'])).toMatchInlineSnapshot(`
    "[0]: number: no params
    [2]: number: no params"
  `);
});

test('Struct types can be validated', () => {
  const userTn = struct({ age: number(), weights: list(number()) });

  expect(tvalidate(userTn, '')).toMatchInlineSnapshot(`"object: no params"`);

  expect(tvalidate(userTn, { weights: [0, 1, '2'] })).toMatchInlineSnapshot(`
    "age: number: no params
    weights[2]: number: no params"
  `);

  expectNoErrors(validate(userTn, { age: 42, weights: [0, 1, 2] }));
});

test('Struct errors can be converted to form compatible errors', () => {
  const userTn = struct({ age: number(), weights: list(number()) });

  const errors = toFormValidationErrors(
    // @ts-expect-error // Static check
    validate(userTn, { weights: [0, '0'] })
  );

  expect(errors).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "number: no params",
        "path": "age",
      },
      Object {
        "message": "number: no params",
        "path": "weights[1]",
      },
    ]
  `);
});

test('Multi field validation can be described via union types', () => {
  const adult = struct({
    name: string(),
    age: number().pipe(moreThan(18)),
    likesAlcohol: boolean(),
  });

  const child = struct({
    name: string(),
    age: number().pipe(lessThan(18)),
    likesAlcohol: boolean().pipe(exact(false)),
  });

  const user = or(adult, child);

  expect(tvalidate(user, {})).toMatchInlineSnapshot(`
    "name: string: no params
    age: number: no params
    likesAlcohol: boolean: no params
    name: string: no params
    age: number: no params
    likesAlcohol: boolean: no params"
  `);

  expect(tvalidate(user, { name: 'John', age: 12, likesAlcohol: true }))
    .toMatchInlineSnapshot(`
    "age: moreThan: 18
    likesAlcohol: exact: false"
  `);

  expectNoErrors(validate(user, { name: 'John', age: 20, likesAlcohol: true }));

  expectNoErrors(
    validate(user, { name: 'Jane', age: 10, likesAlcohol: false })
  );
});

test('recursive structures can be validated as well', () => {
  const tn = tree(number());

  expect(tvalidate(tn, '')).toMatchInlineSnapshot(`
    "nil: no params
    object: no params"
  `);

  expect(tvalidate(tn, { left: '', right: false })).toMatchInlineSnapshot(`
    "nil: no params
    value: number: no params
    left: nil: no params
    left: object: no params
    right: nil: no params
    right: object: no params"
  `);

  expect(tvalidate(tn, { value: 0, left: null, right: {} }))
    .toMatchInlineSnapshot(`
    "nil: no params
    right: nil: no params
    right.value: number: no params"
  `);
});

test('func validates return values', () => {
  const tn = func([number()], number());

  expect(validate(tn, () => 'Hello' as never)).toMatchInlineSnapshot(`
    Array [
      Object {
        "kind": "number",
        "params": undefined,
        "paths": Array [],
      },
    ]
  `);

  expectNoErrors(validate(tn, (a) => a * a));
});

test('func allows to create wrap functions', () => {
  const tn = func([number()], number());

  const wrapped = tn.wrap((a) => {
    if (a > 10) {
      return 'not supported' as never;
    }

    return a * a;
  });

  expect(wrapped(2)).toMatchInlineSnapshot(`4`);

  expect(() => wrapped('2' as never)).toThrowErrorMatchingInlineSnapshot(
    `"number: no params"`
  );

  expect(() => wrapped(20)).toThrowErrorMatchingInlineSnapshot(
    `"number: no params"`
  );
});

function expectNoErrors(errors: unknown[]) {
  expect(errors.length).toBe(0);
}

function tvalidate(tn: TypeNode, value: unknown): string {
  return toReadableErrors(validate(tn, value));
}
