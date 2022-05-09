import { struct } from './record-type-node/struct';
import { number } from './type-node/primitives';
import { list } from './container-type-node/list';
import { andValidate, defaultsTo } from './operators';
import { nonEmptyList } from './container-type-node/operators';
import { biggerOrEqThan, dividableBy } from './type-node/operators';
import { pickRewrite } from './record-type-node/pickRewrite';

describe('list', () => {
  describe('Validates and generates defaults', () => {
    it('validates with static checking', () => {
      const userTn = struct({ age: number(), weights: list(number()) });

      const notAnObject = '';

      // @ts-ignore // Static check
      expect(userTn.validate(notAnObject)).toMatchSnapshot();

      const notAllProps = {};

      // @ts-ignore // Static check
      expect(userTn.validate(notAllProps)).toMatchSnapshot();

      const weightsInvalid = { age: 42, weights: [0, 1, '2'] };

      // @ts-ignore // Static check
      expect(userTn.validate(weightsInvalid)).toMatchSnapshot();

      const user = { age: 42, weights: [0, 1, 2] };

      expectNoErrors(userTn.validate(user));
    });

    it('allows to add whole object validations', () => {
      const userTn = struct({ age: number(), weights: list(number()) }).wrap(
        andValidate((user) => {
          if (user.age > 10) {
            return pickRewrite(userTn, {
              age: (tn) => tn.wrap(dividableBy(12)),
              weights: (tn) => tn.wrap(nonEmptyList()),
            }).validate(user);
          }

          return pickRewrite(userTn, {
            age: (tn) => tn.wrap(biggerOrEqThan(3)),
          }).validate(user);
        }),
        defaultsTo(() => ({ age: 3, weights: [] }))
      );

      const invalid = {
        age: 20,
        weights: [],
      };

      expect(userTn.validate(invalid)).toMatchSnapshot();

      const valid0 = {
        age: 10,
        weights: [],
      };

      expectNoErrors(userTn.validate(valid0));

      const valid1 = {
        age: 12,
        weights: [1],
      };

      expectNoErrors(userTn.validate(valid1));
      expectNoErrors(userTn.validate(userTn.defaults()));
    });
  });
});

function expectNoErrors(errors: unknown[]) {
  expect(errors.length).toBe(0);
}
