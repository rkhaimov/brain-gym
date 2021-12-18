export async function searchOptions(search: string) {
  console.log('Start Searching with', search);

  await wait(Math.random() * 10_000);

  console.log('Done Searching with', search);

  return ['Option 1', 'Option 2', 'Option 3', search];
}

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
