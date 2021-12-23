import { from, Observable, switchMap, timer } from 'rxjs';
import { VirtualElement } from '../../global';
import { createElement } from '../rendering/createElement';
import { wait } from '../utils';

// take one
// lazy

export const ui$ = <div>{renderUserList()}</div>;

function renderUserList(): Observable<VirtualElement> {
  return from(getAllUsers()).pipe(
    switchMap((users) => {
      return (
        <div>
          {users.map((user) => (
            <h1>{user}</h1>
          ))}
        </div>
      );
    })
  );
}

async function getAllUsers() {
  await wait(5_000);

  return ['User 1', 'User 2', 'User 3'];
}

function createSpinner(): Observable<VirtualElement> {
  return timer(0, 1_000).pipe(
    switchMap((n) => (
      <h1>{['Loading', 'Loading.', 'Loading..', 'Loading...'][n % 4]}</h1>
    ))
  );
}
