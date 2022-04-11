import { boolean, number, string } from './primitives';
import { nullable, or } from './widening';
import { validate } from './index';
import { struct } from './hotn';

describe('Each type can be widened', () => {
  it('number can be nullable', () => {
    const empty = null;

    expect(validate(nullable(number()), empty)).toMatchInlineSnapshot(
      `Array []`
    );

    const numeric = 42;

    expect(validate(nullable(number()), numeric)).toMatchInlineSnapshot(
      `Array []`
    );

    const notnumber = '42';

    // @ts-expect-error // Static protection
    expect(validate(nullable(number()), notnumber)).toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "Not a number",
          "path": "",
        },
      ]
    `);
  });

  it('number or string', () => {
    const numeric = 42;

    expect(validate(or(number(), string()), numeric)).toMatchInlineSnapshot(
      `Array []`
    );

    const chars = '42';

    expect(validate(or(number(), string()), chars)).toMatchInlineSnapshot(
      `Array []`
    );

    const neither = false;

    // @ts-expect-error // Static protection
    expect(validate(or(number(), string()), neither)).toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "Not a number",
          "path": "",
        },
        Object {
          "message": "Not a string",
          "path": "",
        },
      ]
    `);
  });

  it('only struct can be extendable with another struct', () => {
    const deletableTn = struct({
      deleted: boolean(),
      deletedAt: nullable(string()),
    });

    const userTn = struct({ name: string() });

    const deletableUserTn = userTn.extend(deletableTn);

    const valid = {
      name: 'John',
      deleted: false,
      deletedAt: undefined,
    };

    expect(validate(deletableUserTn, valid)).toMatchInlineSnapshot(`Array []`);

    const invalid = {
      name: true,
      deletedAt: 0,
    };

    // @ts-expect-error // Static protection
    expect(validate(deletableUserTn, invalid)).toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "Not a string",
          "path": "name",
        },
        Object {
          "message": "Not a boolean",
          "path": "deleted",
        },
        Object {
          "message": "Not a string",
          "path": "deletedAt",
        },
      ]
    `);
  });

  it('structs can not be extended deeply', () => {
    const nameoptions = struct({
      options: struct({ surname: boolean(), name: string() }),
    });

    const sizeoptions = struct({
      options: struct({ age: number(), height: number() }),
    });

    const invalid = { options: { height: 1, age: 2 } };

    expect(
      nameoptions.extend(sizeoptions).validate(invalid)
    ).toMatchInlineSnapshot(`Array []`);
  });
});
