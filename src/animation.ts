import { Optional } from './optional';

type Action<TA> = { tag: 'action'; value: TA; next(): Sequence<TA> };
type Idle<TA> = { tag: 'idle'; next(): Sequence<TA> };
type End = null;

type Sequence<TA> = Action<TA> | Idle<TA> | End;

export class Animation<TA> {
  private constructor(private seq: Sequence<TA>) {}

  static range(from: number, to: number): Animation<number> {
    return new Animation<number>(seqrange(from, to));

    function seqrange(from: number, to: number): Sequence<number> {
      if (from >= to) {
        return null;
      }

      return { tag: 'action', value: from, next: () => seqrange(from + 1, to) };
    }
  }

  map = <TB>(transform: (value: TA) => TB): Animation<TB> => {
    return new Animation(seqmap(this.seq));

    function seqmap(seq: Sequence<TA>): Sequence<TB> {
      if (seq === null) {
        return null;
      }

      if (seq.tag === 'idle') {
        return { tag: 'idle', next: () => seqmap(seq.next()) };
      }

      return {
        tag: 'action',
        value: transform(seq.value),
        next: () => seqmap(seq.next()),
      };
    }
  };

  optionalMap = <TB>(transform: (value: TA) => Optional<TB>): Animation<TB> => {
    return new Animation(seqmap(this.seq));

    function seqmap(seq: Sequence<TA>): Sequence<TB> {
      if (seq === null) {
        return null;
      }

      if (seq.tag === 'idle') {
        return { tag: 'idle', next: () => seqmap(seq.next()) };
      }

      return transform(seq.value).fold<Sequence<TB>>(
        { tag: 'idle', next: () => seqmap(seq.next()) },
        (value) => ({
          tag: 'action',
          value,
          next: () => seqmap(seq.next()),
        })
      );
    }
  };

  animate = (effector: (value: TA) => void): void => {
    let current = this.seq;

    const update = () => {
      if (current === null) {
        return;
      }

      if (current.tag === 'action') {
        effector(current.value);
      }

      current = current.next();

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };
}
