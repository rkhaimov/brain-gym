import { ToType, TypeNode } from '../core';

export type TNRecord = Record<keyof any, TypeNode>;
export type TypeNodeRecordToType<TRecord extends TNRecord> = {
  [TKey in keyof TRecord]: ToType<TRecord[TKey]>;
};

export interface StructTypeNode<TRecord extends TNRecord>
  extends TypeNode<TypeNodeRecordToType<TRecord>> {
  record(): TRecord;
}

export const createStructTypeNode = <TRecord extends TNRecord>(config: {
  validate: StructTypeNode<TRecord>['__validate'];
  defaults: StructTypeNode<TRecord>['defaults'];
  record: StructTypeNode<TRecord>['record'];
  translate?: StructTypeNode<TRecord>['translate'];
}) => {
  const tn: StructTypeNode<TRecord> = {
    record: config.record,
    translate: config.translate ?? ((error) => error),
    __validate: config.validate,
    defaults: config.defaults,
    wrap: (transform, ...transforms) =>
      transforms.reduce((last, curr) => curr(last), transform(tn)),
    clone: ({ __validate, ...and }) =>
      createStructTypeNode({
        ...config,
        ...and,
        validate: __validate ?? config.validate,
      }),
  };

  return tn;
};
