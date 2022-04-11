import { list, struct } from './hotn';
import { number, string } from './primitives';
import { validate } from './index';

describe('High order types (generics)', () => {
  it('list ok', () => {
    const value = [42];

    expect(validate(list(number()), value)).toMatchInlineSnapshot(`Array []`);
  });

  it('list error', () => {
    const notlist = '42';

    // @ts-expect-error // Static protection
    expect(validate(list(number()), notlist)).toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "Not an array",
          "path": "",
        },
      ]
    `);

    const notnumber = ['42', 42, '42'];

    // @ts-expect-error // Static protection
    expect(validate(list(number()), notnumber)).toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "Not a number",
          "path": "[0]",
        },
        Object {
          "message": "Not a number",
          "path": "[2]",
        },
      ]
    `);
  });

  it('struct ok', () => {
    const value = { age: 10, weight: 60 };

    expect(
      validate(struct({ age: number(), weight: number() }), value)
    ).toMatchInlineSnapshot(`Array []`);
  });

  it('struct error', () => {
    const notanobject = '42';

    // @ts-expect-error // Static protection
    expect(validate(struct({ age: number(), weight: number() }), notanobject))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "Not an object",
          "path": "",
        },
      ]
    `);

    const invalidprops = { age: '10', weight: '22' };

    // @ts-expect-error // Static protection
    expect(validate(struct({ age: number(), weight: number() }), invalidprops))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "Not a number",
          "path": "age",
        },
        Object {
          "message": "Not a number",
          "path": "weight",
        },
      ]
    `);
  });

  it('complex structures', () => {
    const user = {
      name: 'John',
      age: 12,
      roles: [{ name: 'DIRECTOR' }, 'Invalid role'],
    };

    const userTn = struct({
      name: string(),
      age: number(),
      roles: list(struct({ name: string(), expires: number() })),
    });

    // @ts-expect-error // Static protection
    expect(validate(userTn, user)).toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "Not a number",
          "path": "roles[0].expires",
        },
        Object {
          "message": "Not an object",
          "path": "roles[1]",
        },
      ]
    `);
  });
});
