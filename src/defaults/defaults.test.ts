import { list } from '../container-type-node/list';
import { defaultsFrom } from './defaultsFrom';
import { defaultsMap } from './defaultsMap';
import { hasNonZeroLength } from '../hasNonZeroLength';
import { or } from '../or';
import { struct } from '../record-type-node/struct';
import { brand } from '../type-node/HOT/brand';
import { biggerOrEqThan } from '../type-node/operators/biggerOrEqThan';
import { dividableBy } from '../type-node/operators/dividableBy';
import { lesserThan } from '../type-node/operators/lesserThan';
import { boolean } from '../type-node/types/boolean';
import { exact } from '../type-node/types/exact';
import { nil } from '../type-node/types/nil';
import { number } from '../type-node/types/number';
import { string } from '../type-node/types/string';
import { validate } from '../validate';
import { defaults } from './index';

test('defaults of primitive values follows condition', () => {
  const tn = number();

  expect(validate(tn, tn.defaults())).toEqual([]);
});

test('defaults of primitives can be overridden', () => {
  const numeric = 10;
  const tn = number().wrap(defaultsMap(() => numeric));

  expect(tn.defaults()).toEqual(numeric);
});

test('defaults can be changed by operator to pass additional checks', () => {
  const tn = number().wrap(biggerOrEqThan(50));

  expect(validate(tn, tn.defaults())).toEqual([]);
});

test('error is thrown when defaults do not pass own rules', () => {
  const tn = number().wrap(biggerOrEqThan(5), lesserThan(3));

  expect(() => defaults(tn)).toThrowErrorMatchingSnapshot();
});

test('manual defaults can be provided to avoid such errors', () => {
  const tn = number().wrap(
    dividableBy(2),
    dividableBy(3),
    defaultsMap(() => 2 * 3)
  );

  expect(validate(tn, tn.defaults())).toEqual([]);
});

test('or generates defaults from first type node', () => {
  const left = number();
  const right = nil();
  const tn = or(left, right);

  expect(defaults(tn)).toMatchInlineSnapshot(`0`);

  expect(defaults(tn.wrap(defaultsFrom(right)))).toMatchInlineSnapshot(
    `undefined`
  );
});

test('type augmentations support defaults', () => {
  const tn = brand(number(), 'id');

  expect(validate(tn, tn.defaults())).toMatchInlineSnapshot(`Array []`);
});

test('containers generates empty versions by default but it can be customized', () => {
  const tn = list(number());

  expect(defaults(tn)).toMatchInlineSnapshot(`Array []`);

  const rtn = tn.wrap(hasNonZeroLength());

  expect(() => defaults(rtn)).toThrowErrorMatchingInlineSnapshot(
    `"hasNonZeroLength: no params"`
  );

  const rrtn = rtn.wrap(defaultsMap((_, tn) => [defaults(tn.children())]));

  expect(defaults(rrtn)).toMatchInlineSnapshot(`
    Array [
      0,
    ]
  `);
});

test('struct generates defaults for each of its children', () => {
  const user = struct({
    name: string(),
    age: number().wrap(biggerOrEqThan(10)),
    preferences: struct({ colors: list(string()), dark: boolean() }),
  });

  expect(defaults(user)).toMatchInlineSnapshot(`
    Object {
      "age": 10,
      "name": "",
      "preferences": Object {
        "colors": Array [],
        "dark": false,
      },
    }
  `);
});
