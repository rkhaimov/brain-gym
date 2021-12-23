import { of, switchMap } from 'rxjs';
import { createTodoModel, Filter } from './model';
import { createElement } from '../rendering/createElement';

export function createView({
  handleRemove,
  handleAdd,
  handleFilterCompleted,
  handleFilterUndone,
  handleFilterAll,
  handleSearch,
  handleDoneToggle,
  filter$,
  todos$,
}: ReturnType<typeof createTodoModel>) {
  return (
    <div className={of('app')}>
      <h1>Things to be done</h1>
      <div className={of('search')}>
        <input
          type={of('text')}
          placeholder={of('Search or add new...')}
          onInput={handleSearch}
        />
        <button onClick={handleAdd}>add</button>
      </div>
      {filter$.pipe(
        switchMap((filter) => (
          <div className={of('filters')}>
            <button
              className={of(filter === Filter.All ? 'active' : '')}
              onClick={handleFilterAll}
            >
              all
            </button>
            <button
              className={of(filter === Filter.Completed ? 'active' : '')}
              onClick={handleFilterCompleted}
            >
              completed
            </button>
            <button
              className={of(filter === Filter.Undone ? 'active' : '')}
              onClick={handleFilterUndone}
            >
              undone
            </button>
          </div>
        ))
      )}
      {todos$.pipe(
        switchMap((todos) => (
          <div className={of('todos')}>
            {todos.map((todo) => (
              <div className={of('todo')}>
                <a
                  className={of(todo.done ? 'done' : 'undone')}
                  onClick={() => handleDoneToggle(todo)}
                >
                  {todo.title}
                </a>
                <button onClick={() => handleRemove(todo)}>X</button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
