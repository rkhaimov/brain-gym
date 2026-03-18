import { z } from 'zod';

export type Failure<TKind extends string, TBody> = {
  kind: TKind;
  body: TBody;
};

export const Failure = {
  asSchema: <TKind extends string, T extends z.ZodType>(kind: TKind, body: T) =>
    z.object({
      kind: z.literal(kind),
      body,
    }),
};
