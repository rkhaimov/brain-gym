import { Observable, OperatorFunction } from 'rxjs';

export function byFrame<TValue>(): OperatorFunction<TValue, TValue> {
  return (observable) =>
    new Observable((emitter) => {
      let id: undefined | ReturnType<typeof requestAnimationFrame>;
      const subscription = observable.subscribe((value) => {
        if (id) {
          cancelAnimationFrame(id);

          id = undefined;
        }

        id = requestAnimationFrame(() => emitter.next(value));
      });

      return () => {
        subscription.unsubscribe();

        if (id) {
          cancelAnimationFrame(id);
        }
      };
    });
}