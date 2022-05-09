import { ToType, TypeNode, TypeNodeOperator } from './core';

export const defaultsTo =
  <TTypeNode extends TypeNode>(
    defaults: () => ToType<TTypeNode>
  ): TypeNodeOperator<TTypeNode> =>
  (tn) =>
    tn.clone({ validate: tn.validate, defaults });

export const andValidate =
  <TTypeNode extends TypeNode>(
    validate: TTypeNode['validate']
  ): TypeNodeOperator<TTypeNode> =>
  (tn) =>
    tn.clone({
      validate: (value) => [...tn.validate(value), ...validate(value)],
      defaults: tn.defaults,
    });
