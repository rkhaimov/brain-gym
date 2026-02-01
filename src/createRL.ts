import readline from 'node:readline';

// Simple cli interface
export function createRL() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    ask: (question: string) =>
      new Promise<string>((resolve) =>
        rl.question(`${question}\n\n`, (name) => resolve(name)),
      ),
  };
}
