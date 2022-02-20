type Operation<TElement> = { tag: 'operation'; operation: () => TCO<TElement> };
type End<TElement> = { tag: 'end'; result: TElement };
type TCO<TElement> = Operation<TElement> | End<TElement>;

const TCO = {
  end: <TElement>(result: TElement): End<TElement> => ({
    tag: 'end',
    result,
  }),
  operation: <TElement>(
    operation: () => TCO<TElement>
  ): Operation<TElement> => ({ tag: 'operation', operation }),
  fold: <TElement>(tco: TCO<TElement>): TElement => {
    let _tco: TCO<TElement> = tco;

    while (_tco.tag !== 'end') {
      _tco = _tco.operation();
    }

    return _tco.result;
  },
};

const range0 = (
  from: number,
  to: number,
  state: number[] = []
): TCO<number[]> => {
  if (from === to) {
    return TCO.end(state);
  }

  return TCO.operation(() => range0(from + 1, to, [from, ...state]));
};

console.log(TCO.fold(range0(0, 10 * 10 * 10 * 10)));
