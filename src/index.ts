main();

type TODO = {
  title: string;
  completed: boolean;
  score: number;
};

async function main() {
  const todos = await getAllTodos();

  const total = todos
    .filter((it) => it.completed)
    .reduce((total, todo) => total + toScore(todo), 0);

  if (total % 2 == 0) {
    console.log('Score is even');
  } else {
    console.log('Score is odd');
  }
}

function toScore(todo: TODO): number {
  return todo.title.includes('a') ? -1 * todo.score : todo.score;
}

async function getAllTodos(): Promise<TODO[]> {
  return [
    {
      title: 'Complete homework',
      completed: true,
      score: 10,
    },
    {
      title: 'Program an example',
      completed: false,
      score: 2,
    },
    {
      title: 'Write a function',
      completed: true,
      score: 29,
    },
  ];
}
