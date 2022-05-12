import { fromErrorMessage, fromKindAndPayload, prependErrorPathWith } from '../translate/error';
import {
  createRecordTypeNode,
  TnRecord,
  TnRecordToType,
} from './createRecordTypeNode';
import {
  validate,
} from '../validate';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    object: void;
  }
}

export const struct = <TRecord extends TnRecord>(record: TRecord) =>
  createRecordTypeNode<TRecord>({
    validate: (value) => {
      if (typeof value !== 'object') {
        return [fromKindAndPayload('object')];
      }

      return Object.entries(record).flatMap(([key, tn]) =>
        validate(tn, value[key]).map(prependErrorPathWith(key))
      );
    },
    defaults: () =>
      Object.fromEntries(
        Object.entries(record).map(([key, tn]) => [key, tn.defaults()])
      ) as TnRecordToType<TRecord>,
    record: () => record,
  });
