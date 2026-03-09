import { z } from 'zod';

export const Either = {
  right<TRight>(value: TRight): Either<never, TRight> {
    return { type: 'right', value };
  },
  left<TLeft>(value: TLeft): Either<TLeft, never> {
    return { type: 'left', value };
  },
  isLeft<TLeft>(
    either: Either<TLeft, unknown>,
  ): either is Either<TLeft, never> {
    return either.type === 'left';
  },
  isRight<TRight>(
    either: Either<unknown, TRight>,
  ): either is Either<never, TRight> {
    return either.type === 'right';
  },
  asSchema: <TLeft extends z.ZodType, TRight extends z.ZodType>(
    left: TLeft,
    right: TRight,
  ) =>
    z.discriminatedUnion('type', [
      z.object({ type: z.literal('left'), value: left }),
      z.object({ type: z.literal('right'), value: right }),
    ]),
};

export type Either<TLeft, TRight> =
  | { type: 'left'; value: TLeft }
  | { type: 'right'; value: TRight };
