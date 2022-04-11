import { or } from './widening';
import { number, string } from './primitives';
import { and } from './narrowing';
import { validate } from './index';

describe('Types can be narrowing using static/dynamic checkers', () => {
  it('string or number to just a number', () => {
    const chars = '42';

    expect(
      // @ts-expect-error // Static protection
      validate(and(or(string(), number()), number()), chars)
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "Not a number",
          "path": "",
        },
      ]
    `);

    const bool = false;

    expect(
      // @ts-expect-error // Static protection
      validate(and(or(string(), number()), number()), bool)
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "Not a string",
          "path": "",
        },
        Object {
          "message": "Not a number",
          "path": "",
        },
        Object {
          "message": "Not a number",
          "path": "",
        },
      ]
    `);

    const numeric = 42;

    expect(
      validate(and(or(string(), number()), number()), numeric)
    ).toMatchInlineSnapshot(`Array []`);
  });
});
