import { number } from './type-node/primitives';
import { list } from './container-type-node/list';
import { nonEmptyList } from './container-type-node/operators';

describe('list', () => {
  describe('Validates and generates defaults', () => {
    it('validates with static checking', () => {
      const tn = list(number());

      const emptyList: number[] = [];

      expectNoErrors(tn.validate(emptyList));

      const numericList = [42];

      expectNoErrors(tn.validate(numericList));

      const chars = '42';

      // @ts-ignore // Static check
      expect(tn.validate(chars)).toMatchSnapshot();

      const heteroList = ['42', 42, '42'];

      // @ts-ignore // Static check
      expect(tn.validate(heteroList)).toMatchSnapshot();
    });

    it('generates defaults for composite types', () => {
      const tn = list(number()).wrap(nonEmptyList());
      const emptyList: number[] = [];

      expect(tn.validate(emptyList)).toMatchSnapshot();

      expectNoErrors(tn.validate(tn.defaults()));
    });
  });
});

function expectNoErrors(errors: unknown[]) {
  expect(errors.length).toBe(0);
}
