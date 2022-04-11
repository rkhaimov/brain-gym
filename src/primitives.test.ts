import { number } from './primitives';
import { narrow, validate } from './index';

describe('Primitive types', () => {
  it('number ok', () => {
    const value = 42;

    expect(validate(number(), value)).toMatchInlineSnapshot(`Array []`);
  });

  it('number error', () => {
    const value = '42';

    // @ts-expect-error // Static protection
    expect(validate(number(), value)).toMatchInlineSnapshot(`
      Array [
        Object {
          "message": "Not a number",
          "path": "",
        },
      ]
    `);
  });

  it('number narrows type', () => {
    const value: unknown = 42;

    const result: number = narrow(number(), value);

    expect(result).toEqual(value);
  });

  it('number throws error in case narrow fault', () => {
    const value: unknown = '42';

    expect(() => narrow(number(), value)).toThrowErrorMatchingInlineSnapshot(
      `"Empty path: Not a number"`
    );
  });
});
