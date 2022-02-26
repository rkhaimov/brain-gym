import { TypeConstructor } from './types';
import { Either } from '../either';

export const struct =
  <TStruct extends Struct>(sct: TStruct): StructTypeConstructor<TStruct> =>
  (_value) => {
    if (typeof _value !== 'object') {
      return Either.left('is not an object');
    }

    if (_value === null) {
      return Either.left('is null');
    }

    const validations = Object.entries(sct).map(([key, property]) =>
      toKeyErrorPair(property(get(_value, key)), key)
    );

    return Either.sequenceA(validations).leftMap(
      toErrorStruct
    ) as StructEither<TStruct>;
  };

const get = (object: object, key: string): unknown =>
  (object as Record<string, unknown>)[key];

const toKeyErrorPair = <TLeft, TRight>(
  either: Either<TLeft, TRight>,
  key: string
): Either<[string, TLeft], TRight> => {
  return either.leftMap((left) => [key, left]);
};

const toErrorStruct = <TLeft>(
  errors: [string, TLeft][]
): Record<string, TLeft> => {
  return Object.fromEntries(errors);
};

type Struct = Record<string, TypeConstructor<unknown, unknown>>;

type StructTypeConstructor<TStruct> = TypeConstructor<
  StructToError<TStruct> | string,
  StructToType<TStruct>
>;

type StructEither<TStruct> = Either<
  StructToError<TStruct> | string,
  StructToType<TStruct>
>;

type StructToType<TStruct> = TStruct extends TypeConstructor<
  unknown,
  infer RType
>
  ? RType
  : { [P in keyof TStruct]: StructToType<TStruct[P]> };

type StructToError<TStruct> = TStruct extends TypeConstructor<
  infer RError,
  unknown
>
  ? RError
  : { [P in keyof TStruct]: StructToError<TStruct[P]> };
