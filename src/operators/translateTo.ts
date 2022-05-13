import { TypeNode } from '../core';
import { Dictionary } from '../translate/dictionary';

export const translateTo =
  (dictionary: Dictionary) =>
  <TTypeNode extends TypeNode>(tn: TTypeNode) => ({
    ...tn,
    dictionary: () => ({ ...tn.dictionary(), ...dictionary }),
  });
