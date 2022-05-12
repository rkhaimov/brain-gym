import { list } from './container-type-node/list';
import { hasExactLength } from './hasExactLength';
import { or } from './or';
import { rewrite } from './record-type-node/HOTn';
import { struct } from './record-type-node/struct';
import { translateTo } from './translateTo';
import { exact } from './type-node/types/exact';
import { number } from './type-node/types/number';
import { toFormValidationErrors, validate } from './validate';

describe('list', () => {
  describe('Validates and generates defaults', () => {
    it('validates with static checking', () => {
      const userTn = struct({ age: number(), weights: list(number()) });

      // @ts-expect-error // Static check
      expect(validate(userTn, '')).toMatchSnapshot();

      // @ts-expect-error // Static check
      expect(validate(userTn, {})).toMatchSnapshot();

      expect(
        validate(userTn, { age: 42, weights: [0, 1, '2'] })
      ).toMatchSnapshot();

      expectNoErrors(validate(userTn, { age: 42, weights: [0, 1, 2] }));
    });

    it('able to handle or validation', () => {
      const userTn = or(
        struct({
          type: exact('hr'),
          values: list(number()).wrap(
            hasExactLength(1),
            translateTo({
              hasExactLength: (size) =>
                `List has to have size of ${size} for HR`,
            })
          ),
        }),
        struct({
          type: exact('ecg'),
          values: list(number()).wrap(
            hasExactLength(3),
            translateTo({
              hasExactLength: (size) =>
                `List has to have size of ${size} for ECG`,
            })
          ),
        })
      ).wrap(translateTo({ exact: (type) => `Type must be exact ${type}` }));

      // @ts-expect-error // Static check
      expect(validate(userTn, {})).toMatchSnapshot();

      expect(
        validate(userTn, {
          // @ts-expect-error // Static check
          type: '',
        })
      ).toMatchSnapshot();

      expect(
        validate(userTn, {
          type: 'hr' as const,
          values: [],
        })
      ).toMatchSnapshot();

      expect(
        toFormValidationErrors(
          validate(userTn, {
            type: 'hr' as const,
            values: [1, 2, 3],
          })
        )
      ).toMatchSnapshot();

      expectNoErrors(
        validate(userTn, {
          type: 'hr' as const,
          values: [1],
        })
      );
    });

    it('allows to rewrite validation', () => {
      const tn = struct({
        age: number(),
        weight: number(),
      }).wrap(translateTo({ number: () => 'Not a number' }));

      const rtn = rewrite(tn, {
        age: (tn) =>
          tn.wrap(translateTo({ number: () => 'Age should be a number' })),
      });

      // @ts-expect-error static-check
      expect(validate(rtn, { age: '', weight: '' })).toMatchSnapshot();
    });
  });
});

function expectNoErrors(errors: unknown[]) {
  expect(errors.length).toBe(0);
}
