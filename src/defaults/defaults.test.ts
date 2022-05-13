import { list } from '../types/list';
import { defaultsFrom } from '../operators/defaultsFrom';
import { defaultsMap } from '../operators/defaultsMap';
import { notEmpty } from '../operators/notEmpty';
import { or } from '../augmentors/or';
import { struct } from '../types/struct';
import { brand } from '../augmentors/brand';
import { greaterThan } from '../operators/greaterThan';
import { dividableBy } from '../operators/dividableBy';
import { lesserThan } from '../operators/lesserThan';
import { boolean } from '../types/boolean';
import { nil } from '../types/nil';
import { number } from '../types/number';
import { string } from '../types/string';
import { defaults } from './index';

test('defaults of primitive values follows condition', () => {
  const tn = number();

  expect(defaults(tn)).toMatchInlineSnapshot(`0`);
});

test('defaults of primitives can be overridden', () => {
  const numeric = 10;
  const tn = number().operate(defaultsMap(() => numeric));

  expect(defaults(tn)).toEqual(numeric);
});

test('defaults can be changed by operator to pass additional checks', () => {
  const tn = number().operate(greaterThan(50));

  expect(defaults(tn)).toMatchInlineSnapshot(`51`);
});

test('error is thrown when defaults do not pass own rules', () => {
  const tn = number().operate(greaterThan(5), lesserThan(3));

  expect(() => defaults(tn)).toThrowErrorMatchingSnapshot();
});

test('manual defaults can be provided to avoid such errors', () => {
  const tn = number().operate(
    dividableBy(2),
    dividableBy(3),
    defaultsMap(() => 2 * 3)
  );

  expect(defaults(tn)).toMatchInlineSnapshot(`6`);
});

test('or generates defaults from first type node', () => {
  const left = number();
  const right = nil();
  const tn = or(left, right);

  expect(defaults(tn)).toMatchInlineSnapshot(`0`);

  expect(defaults(tn.operate(defaultsFrom(right)))).toMatchInlineSnapshot(
    `undefined`
  );
});

test('type augmentations support defaults', () => {
  const tn = brand(number(), 'id');

  expect(defaults(tn)).toMatchInlineSnapshot(`0`);
});

test('containers generates empty versions by default but it can be customized', () => {
  const tn = list(number());

  expect(defaults(tn)).toMatchInlineSnapshot(`Array []`);

  const rtn = tn.operate(notEmpty());

  expect(() => defaults(rtn)).toThrowErrorMatchingInlineSnapshot(
    `"notEmpty: no params"`
  );

  const rrtn = rtn.operate(defaultsMap((tn) => [defaults(tn.children())]));

  expect(defaults(rrtn)).toMatchInlineSnapshot(`
    Array [
      0,
    ]
  `);
});

test('struct generates defaults for each of its children', () => {
  const user = struct({
    name: string(),
    age: number().operate(greaterThan(10)),
    preferences: struct({ colors: list(string()), dark: boolean() }),
  });

  expect(defaults(user)).toMatchInlineSnapshot(`
    Object {
      "age": 11,
      "name": "",
      "preferences": Object {
        "colors": Array [],
        "dark": false,
      },
    }
  `);
});
