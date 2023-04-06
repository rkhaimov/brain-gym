main();

type TODO = {
  title: string;
  completed: boolean;
  score: number;
};

async function main() {
  const todos = await getAllTodos();

  const program = (todos: TODO[]) =>
    calcTotal(toTargetScores(takeCompleted(todos)));

  const total = program(todos);

  if (total % 2 == 0) {
    console.log('Score is even');
  } else {
    console.log('Score is odd');
  }
}

function takeCompleted(todos: TODO[]): TODO[] {
  return todos.filter((it) => it.completed);
}

function toTargetScores(todos: TODO[]): number[] {
  return todos.map((it) => (it.title.includes('a') ? -1 * it.score : it.score));
}

function calcTotal(scores: number[]): number {
  return scores.reduce((total, score) => total + score, 0);
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
