import { InferType, TypeNode } from '../core';
import { InternalValidationError } from '../translate/error';
import { validateConcatMap } from '../operators/validateConcatMap';
import { defaultsMap } from '../operators/defaultsMap';
import { childrenMap } from '../operators/childrenMap';

export const refine = <
  TTypeNode extends TypeNode,
  TType extends InferType<TTypeNode>,
  TChildren
>(
  tn: TTypeNode,
  config: {
    validate(
      value: InferType<TTypeNode>,
      tn: TypeNode<TType, TChildren>
    ): InternalValidationError[];
    defaults(tn: TypeNode<TType, TChildren>): TType;
    children?(): TChildren;
  }
) => {
  const rtn = tn.operate(
    validateConcatMap((value, tn) =>
      config.validate(value, tn as TypeNode<TType, TChildren>)
    ),
    defaultsMap((tn) => config.defaults(tn as TypeNode<TType, TChildren>))
  ) as TypeNode<TType, TChildren>;

  if (config.children) {
    return rtn.operate(childrenMap(config.children));
  }

  return rtn;
};
