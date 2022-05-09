import { TypeNode, TypeNodeOperator } from '../core';
import { andValidate, defaultsTo } from '../operators';
import { fromErrorMessage } from '../validate';

export const biggerOrEqThan =
  (than: number): TypeNodeOperator<TypeNode<number>> =>
  (tn) =>
    tn.wrap(
      defaultsTo(() => than),
      andValidate((value) => {
        if (value >= than) {
          return [];
        }

        return [fromErrorMessage(`Lesser than ${than}`)];
      })
    );

export const lesserOrEqThan =
  (than: number): TypeNodeOperator<TypeNode<number>> =>
  (tn) =>
    tn.wrap(defaultsTo(() => than)).wrap(
      andValidate((value) => {
        if (value <= than) {
          return [];
        }

        return [fromErrorMessage(`Bigger than ${than}`)];
      })
    );

export const dividableBy =
  (factor: number): TypeNodeOperator<TypeNode<number>> =>
  (tn) =>
    tn.wrap(defaultsTo(() => factor)).wrap(
      andValidate((value) => {
        if (value % factor === 0) {
          return [];
        }

        return [fromErrorMessage(`Not dividable by ${factor}`)];
      })
    );
