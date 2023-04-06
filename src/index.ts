main();

type TODO = {
  title: string;
  completed: boolean;
  score: number;
};

async function main() {
  const todos = await getAllTodos();

  let total = 0;
  for (const todo of todos) {
    if (todo.completed) {
      if (todo.title.includes('a')) {
        total -= todo.score;
      } else {
        total += todo.score;
      }
    }
  }

  if (total % 2 == 0) {
    console.log('Score is even');
  } else {
    console.log('Score is odd');
  }
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
