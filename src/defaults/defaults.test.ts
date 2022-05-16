import { list } from '../types/list';
import { lengthMin } from '../operators/lengthMin';
import { or } from '../hot/or';
import { struct } from '../types/struct';
import { brand } from '../hot/brand';
import { moreThan } from '../operators/moreThan';
import { lessThan } from '../operators/lessThan';
import { boolean } from '../types/boolean';
import { nil } from '../types/nil';
import { number } from '../types/number';
import { string } from '../types/string';
import { defaults } from './index';
import { defaultsMap } from '../operators/defaultsMap';
import { defaultsFrom } from '../operators/defaultsFrom';
import { func } from '../types/func';
import { validate } from '../validate';

test('defaults of primitive values follows condition', () => {
  const tn = number();

  expect(defaults(tn)).toMatchInlineSnapshot(`0`);
});

test('defaults of primitives can be overridden', () => {
  const numeric = 10;
  const tn = number().pipe(defaultsMap(() => numeric));

  expect(defaults(tn)).toEqual(numeric);
});

test('defaults can be changed by operator to pass additional checks', () => {
  const tn = number().pipe(moreThan(50));

  expect(defaults(tn)).toMatchInlineSnapshot(`51`);
});

test('error is thrown when defaults do not pass own rules', () => {
  const tn = number().pipe(moreThan(5), lessThan(3));

  expect(() => defaults(tn)).toThrowErrorMatchingSnapshot();
});

test('manual defaults can be provided to avoid such errors', () => {
  const tn = number().pipe(
    moreThan(10),
    moreThan(5),
    defaultsMap(() => 20)
  );

  expect(defaults(tn)).toMatchInlineSnapshot(`20`);
});

test('or generates defaults from first type node', () => {
  const left = number();
  const right = nil();
  const tn = or(left, right);

  expect(defaults(tn)).toMatchInlineSnapshot(`0`);

  expect(defaults(tn.pipe(defaultsFrom(right)))).toMatchInlineSnapshot(
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

  const rtn = tn.pipe(lengthMin(1));

  expect(() => defaults(rtn)).toThrowErrorMatchingInlineSnapshot(
    `"lengthMin: 1"`
  );

  const rrtn = rtn.pipe(defaultsMap(() => [defaults(tn.children())]));

  expect(defaults(rrtn)).toMatchInlineSnapshot(`
    Array [
      0,
    ]
  `);
});

test('struct generates defaults for each of its children', () => {
  const user = struct({
    name: string(),
    age: number().pipe(moreThan(10)),
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

test('func can generate default value', () => {
  const tn = func([number()], number());
  const generated = defaults(tn);

  expect(validate(tn, generated)).toMatchInlineSnapshot(`Array []`);
  expect(generated(2)).toMatchInlineSnapshot(`0`);
});
