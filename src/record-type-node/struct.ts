import {
  createStructTypeNode,
  TNRecord,
  TypeNodeRecordToType,
} from './createStructTypeNode';
import {
  fromErrorMessage,
  fromKindAndPayload,
  prependErrorPathWith,
  validate,
} from '../validate';

declare module 'validation-messages' {
  interface ValidationMessages {
    object: void;
  }
}

export const struct = <TRecord extends TNRecord>(record: TRecord) =>
  createStructTypeNode<TRecord>({
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
      ) as TypeNodeRecordToType<TRecord>,
    record: () => record,
  });
