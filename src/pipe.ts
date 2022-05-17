type Project<T, A> = (arg: T) => A;

type Pipe = {
  <T>(arg: T): T;
  <T, A>(arg: T, op1: Project<T, A>): A;
  <T, A, B>(arg: T, op1: Project<T, A>, op2: Project<A, B>): B;
  <T, A, B, C>(
    arg: T,
    op1: Project<T, A>,
    op2: Project<A, B>,
    op3: Project<B, C>
  ): C;
  <T, A, B, C, D>(
    arg: T,
    op1: Project<T, A>,
    op2: Project<A, B>,
    op3: Project<B, C>,
    op4: Project<C, D>
  ): D;
  <T, A, B, C, D, E>(
    arg: T,
    op1: Project<T, A>,
    op2: Project<A, B>,
    op3: Project<B, C>,
    op4: Project<C, D>,
    op5: Project<D, E>
  ): E;
  <T, A, B, C, D, E, F>(
    arg: T,
    op1: Project<T, A>,
    op2: Project<A, B>,
    op3: Project<B, C>,
    op4: Project<C, D>,
    op5: Project<D, E>,
    op6: Project<E, F>
  ): F;
  <T, A, B, C, D, E, F, G>(
    arg: T,
    op1: Project<T, A>,
    op2: Project<A, B>,
    op3: Project<B, C>,
    op4: Project<C, D>,
    op5: Project<D, E>,
    op6: Project<E, F>,
    op7: Project<F, G>
  ): G;
  <T, A, B, C, D, E, F, G, H>(
    arg: T,
    op1: Project<T, A>,
    op2: Project<A, B>,
    op3: Project<B, C>,
    op4: Project<C, D>,
    op5: Project<D, E>,
    op6: Project<E, F>,
    op7: Project<F, G>,
    op8: Project<G, H>
  ): H;
  <T, A, B, C, D, E, F, G, H, I>(
    arg: T,
    op1: Project<T, A>,
    op2: Project<A, B>,
    op3: Project<B, C>,
    op4: Project<C, D>,
    op5: Project<D, E>,
    op6: Project<E, F>,
    op7: Project<F, G>,
    op8: Project<G, H>,
    op9: Project<H, I>
  ): I;
  <T, A, B, C, D, E, F, G, H, I>(
    arg: T,
    op1: Project<T, A>,
    op2: Project<A, B>,
    op3: Project<B, C>,
    op4: Project<C, D>,
    op5: Project<D, E>,
    op6: Project<E, F>,
    op7: Project<F, G>,
    op8: Project<G, H>,
    op9: Project<H, I>,
    ...operations: Project<any, any>[]
  ): unknown;
};

const pipe: Pipe = (
  arg: unknown,
  ...fs: Array<(arg: unknown) => unknown>
): unknown => fs.reduce((last, f) => f(last), arg);
