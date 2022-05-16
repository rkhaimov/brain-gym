import { Operator } from '../core';
import { Dictionary } from '../translate/dictionary';

export const translateTo =
  <TType>(dictionary: Dictionary): Operator<TType> =>
    (tn) => ({
      ...tn,
      dictionary: { ...tn.dictionary, ...dictionary }
    });
