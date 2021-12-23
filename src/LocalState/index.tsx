import { BehaviorSubject, finalize, switchMap } from 'rxjs';
import { createElement } from '../rendering/createElement';

function createToggle() {
  const toggle$ = new BehaviorSubject(false);

  return toggle$.pipe(
    finalize(() => console.log('Was destroyed!')),
    switchMap((toggled) => (
      <button onClick={() => toggle$.next(!toggled)}>
        {toggled ? 'Toggled' : 'Untoggled'}
      </button>
    ))
  );
}

const remove$ = new BehaviorSubject(false);

export const ui$ = (
  <div>
    <div>{createToggle()}</div>
    {remove$.pipe(
      switchMap((removed) =>
        removed ? <h1>Removed :(</h1> : <div>{createToggle()}</div>
      )
    )}
    <button onClick={() => remove$.next(true)}>Remove</button>
  </div>
);
