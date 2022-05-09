import {
  createRecordTypeNode,
  TNRecord,
  TypeNodeRecordToType,
} from './createRecordTypeNode';
import { fromErrorMessage, prependErrorPathWith } from '../validate';

export const struct = <TRecord extends TNRecord>(record: TRecord) =>
  createRecordTypeNode<TRecord>({
    validate: (value) => {
      if (typeof value !== 'object') {
        return [fromErrorMessage('not an object')];
      }

      return Object.entries(record).flatMap(([key, tn]) =>
        tn.validate(value[key]).map(prependErrorPathWith(key))
      );
    },
    defaults: () =>
      Object.fromEntries(
        Object.entries(record).map(([key, tn]) => [key, tn.defaults()])
      ) as TypeNodeRecordToType<TRecord>,
    record: () => record,
  });
