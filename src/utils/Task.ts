import { Either } from './Either';

export type Task<TLeft, TRight> = Promise<Either<TLeft, TRight>>;

export const Task = {
  all: async <TLeft, TRight>(
    tasks: Task<TLeft, TRight>[],
  ): Task<TLeft[], TRight[]> => {
    const results = await Promise.all(tasks);

    let output: Either<TLeft[], TRight[]> = Either.right([]);
    for (const result of results) {
      if (Either.isLeft(result)) {
        output = Either.isLeft(output)
          ? Either.left([...output.value, result.value])
          : Either.left([]);
      } else {
        output = Either.isRight(output)
          ? Either.right([...output.value, result.value])
          : output;
      }
    }

    return output;
  },
};
