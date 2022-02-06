export const map =
  <TSource, TTarget>(f: (value: TSource) => TTarget) =>
  <TFunctor extends Functor<TSource>>(functor: TFunctor) =>
    functor.map(f) as TFunctor;

interface Functor<TValue> {
  map<TReturn>(clb: (value: TValue) => TReturn): this;
}
