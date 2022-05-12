import { defaultsMap } from './defaultsMap';
import { or } from './or';
import { translateTo } from './translateTo';
import { brand } from './type-node/HOT/brand';
import { biggerOrEqThan } from './type-node/operators/biggerOrEqThan';
import { dividableBy } from './type-node/operators/dividableBy';
import { lesserOrEqThan } from './type-node/operators/lesserOrEqThan';
import { nil } from './type-node/types/nil';
import { number } from './type-node/types/number';
import { defaults, narrow, validate } from './validate';

describe('Primitive types', () => {
  describe('Validates and generates defaults', () => {
    it('validates with static checking', () => {
      expectNoErrors(validate(number(), 42));

      // @ts-expect-error // Static check
      expect(validate(number(), '42')).toMatchSnapshot();
    });

    it('narrows in assertion like manner', () => {
      const numeric: unknown = 42;

      expect(narrow(number(), numeric)).toEqual(numeric);

      expect(() => narrow(number(), '42')).toThrowErrorMatchingSnapshot();
    });

    it('generates defaults which must hold the following property', () => {
      const tn = number();

      expect(validate(tn, tn.defaults())).toEqual([]);
    });

    it('allows to override defaults', () => {
      const numeric = 10;
      const tn = number().wrap(defaultsMap(() => numeric));

      expect(tn.defaults()).toEqual(numeric);
    });

    it('allows to override error message', () => {
      const tn = number().wrap(
        biggerOrEqThan(10),
        dividableBy(2),
        translateTo({
          biggerOrEqThan: (n) => `Should be greater than ${n}`,
          dividableBy: (n) => `Should be dividable by ${n}`,
        })
      );

      expect(validate(tn, 2)).toMatchSnapshot();

      expect(validate(tn, 13)).toMatchSnapshot();

      const rtn = tn.wrap(
        translateTo({
          dividableBy: (n) => `Please, provide value dividable by ${n}`,
        })
      );

      expect(validate(rtn, 13)).toMatchSnapshot();
      expect(validate(tn.wrap(dividableBy(5)), 12)).toMatchSnapshot();
    });
  });

  describe('Constraints composition', () => {
    it('allows to add additional constraints', () => {
      const tn = number().wrap(biggerOrEqThan(50));

      expect(validate(tn, 20)).toMatchSnapshot();

      // @ts-expect-error // Static check
      expect(validate(tn, '60')).toMatchSnapshot();

      // @ts-expect-error // Static check
      expect(validate(tn, '42')).toMatchSnapshot();

      expectNoErrors(validate(tn, 100));
    });

    it('generates defaults for composite types', () => {
      const tn = number().wrap(biggerOrEqThan(50));

      expect(validate(tn, tn.defaults())).toEqual([]);
    });

    it('throws non matching defaults error', () => {
      const tn = number().wrap(biggerOrEqThan(5)).wrap(lesserOrEqThan(3));

      expect(() => defaults(tn)).toThrowErrorMatchingSnapshot();
    });

    it('allows to provide manual defaults to bypass error', () => {
      const tn = number().wrap(
        dividableBy(2),
        dividableBy(3),
        defaultsMap(() => 2 * 3)
      );

      expect(validate(tn, tn.defaults())).toEqual([]);
    });
  });

  describe('Type widening', () => {
    it('primitive types can be nullable', () => {
      const tn = or(number(), nil());

      // @ts-expect-error // Static check
      expect(validate(tn, '42')).toMatchSnapshot();

      expectNoErrors(validate(tn, undefined));

      expectNoErrors(validate(tn, 42));
    });

    it('defaults are generated on first value by default and can be customized on demand', () => {
      const tn0 = number();
      const tn1 = nil();
      const tn = or(tn0, tn1);

      expect(tn.defaults()).toEqual(tn0.defaults());

      const customized = tn.wrap(defaultsMap(() => tn1.defaults()));

      expect(customized.defaults()).toEqual(tn1.defaults());
    });
  });

  describe('Type narrowing', () => {
    it('Primitive types can be branded', () => {
      const tn = brand(number(), 'id');

      expectNoErrors(validate(tn, tn.defaults()));
      expectNoErrors(validate(tn, narrow(tn, 42)));
    });
  });
});

function expectNoErrors(errors: unknown[]) {
  expect(errors.length).toBe(0);
}
