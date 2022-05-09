import { nil, number } from './type-node/primitives';
import { narrow } from './validate';
import { biggerOrEqThan, dividableBy, lesserOrEqThan } from './type-node/operators';
import { defaultsTo } from './operators';
import { brand, or } from './type-node/HOTn';

describe('Primitive types', () => {
  describe('Validates and generates defaults', () => {
    it('validates with static checking', () => {
      const numeric = 42;

      expectNoErrors(number().validate(numeric));

      const chars = '42';

      // @ts-ignore // Static check
      expect(number().validate(chars)).toMatchSnapshot();
    });

    it('narrows in assertion like manner', () => {
      const numeric: unknown = 42;

      expect(narrow(number(), numeric)).toEqual(numeric);

      const chars = '42';

      expect(() => narrow(number(), chars)).toThrowErrorMatchingSnapshot();
    });

    it('generates defaults which must hold the following property', () => {
      const tn = number();

      expect(tn.validate(tn.defaults())).toEqual([]);
    });

    it('allows to override defaults', () => {
      const numeric = 10;
      const tn = number().wrap(defaultsTo(() => numeric));

      expect(tn.defaults()).toEqual(numeric);
    });

    it.todo('allows to override error message');
  });

  describe('Constraints composition', () => {
    it('allows to add additional constraints', () => {
      const tn = number().wrap(biggerOrEqThan(50));

      const small = 20;

      expect(tn.validate(small)).toMatchSnapshot();

      const numericChars = '60';

      // @ts-ignore // Static check
      expect(tn.validate(numericChars)).toMatchSnapshot();

      const chars = '42';

      // @ts-ignore // Static check
      expect(tn.validate(chars)).toMatchSnapshot();

      const valid = 100;

      expectNoErrors(tn.validate(valid));
    });

    it('generates defaults for composite types', () => {
      const tn = number().wrap(biggerOrEqThan(50));

      expect(tn.validate(tn.defaults())).toEqual([]);
    });

    it('throws non matching defaults error', () => {
      const tn = number().wrap(biggerOrEqThan(5)).wrap(lesserOrEqThan(3));

      expect(() => tn.defaults()).toThrowErrorMatchingSnapshot();
    });

    it('allows to provide manual defaults to bypass error', () => {
      const tn = number().wrap(
        dividableBy(2),
        dividableBy(3),
        defaultsTo(() => 2 * 3)
      );

      expect(tn.validate(tn.defaults())).toEqual([]);
    });
  });

  describe('Type widening', () => {
    it('primitive types can be nullable', () => {
      const tn = or(number(), nil());

      const chars = '42';

      // @ts-ignore // Static check
      expect(tn.validate(chars)).toMatchSnapshot();

      const empty = undefined;

      expectNoErrors(tn.validate(empty));

      const numeric = 42;

      expectNoErrors(tn.validate(numeric));
    });

    it('defaults are generated on first value by default and can be customized on demand', () => {
      const tn0 = number();
      const tn1 = nil();
      const tn = or(tn0, tn1);

      expect(tn.defaults()).toEqual(tn0.defaults());

      const customized = tn.wrap(defaultsTo(() => tn1.defaults()));

      expect(customized.defaults()).toEqual(tn1.defaults());
    });
  });

  describe('Type narrowing', () => {
    it('Primitive types can be branded', () => {
      const tn = brand(number(), 'id');

      expectNoErrors(tn.validate(tn.defaults()));

      const numeric = 42;

      expectNoErrors(tn.validate(narrow(tn, numeric)));
    });
  });
});

function expectNoErrors(errors: unknown[]) {
  expect(errors.length).toBe(0);
}
