import { uniqueID } from './utils';

// Emulates async external storage
export function createTodoStorage() {
  const todos: Array<{ id: number; content: string; completed: boolean }> = [
    { id: uniqueID(), content: 'Pet a dog', completed: false },
    { id: uniqueID(), content: 'Read a book', completed: false },
    { id: uniqueID(), content: 'Go for a walk', completed: false },
  ];

  return {
    getAll: async () =>
      todos
        .filter((it) => !it.completed)
        .map((it) => ({ id: it.id, content: it.content })),
    create: async (content: string) => {
      todos.push({ id: uniqueID(), content, completed: false });
    },
    complete: async (id: number) => {
      const found = todos.find((it) => it.id === id);

      if (found === undefined) {
        return { error: `Todo was not found by given id: ${id}` };
      }

      found.completed = true;
    },
  };
}
