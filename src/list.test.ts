import { list } from './container-type-node/list';
import { defaultsMap } from './defaultsMap';
import { hasNonZeroLength } from './hasNonZeroLength';
import { translateTo } from './translateTo';
import { biggerOrEqThan } from './type-node/operators/biggerOrEqThan';
import { number } from './type-node/types/number';
import { validate } from './validate';

describe('list', () => {
  describe('Validates and generates defaults', () => {
    it('validates with static checking', () => {
      const tn = list(number());

      expectNoErrors(validate(tn, []));

      expectNoErrors(validate(tn, [42]));

      // @ts-expect-error // Static check
      expect(validate(tn, '42')).toMatchSnapshot();

      expect(validate(tn, ['42', 42, '42'])).toMatchSnapshot();
    });

    it('generates defaults for composite types', () => {
      const tn = list(number().wrap(biggerOrEqThan(10))).wrap(
        hasNonZeroLength(),
        defaultsMap((_, tn) => [tn.children().defaults()]),
        translateTo({ biggerOrEqThan: () => 'Number is too small' })
      );

      expect(validate(tn, [])).toMatchSnapshot();
      expectNoErrors(validate(tn, tn.defaults()));
      expect(validate(tn, [2])).toMatchSnapshot();
    });
  });
});

function expectNoErrors(errors: unknown[]) {
  expect(errors.length).toBe(0);
}
