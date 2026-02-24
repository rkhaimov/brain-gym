import * as fs from 'node:fs';

export async function createSearcher(
  documents: string[],
  { k }: { k: number },
) {
  const store: number[][] = JSON.parse(
    fs.readFileSync('./embeddings.json').toString('utf-8'),
  );

  return {
    search: async (query: string) => {
      const [embedded] = await embed([query]);

      return store
        .map((it, index) => ({
          it,
          document: documents[index],
          similarity: cosine(embedded, it),
        }))
        .sort((a, b) => (a.similarity > b.similarity ? -1 : 1))
        .slice(0, k)
        .map((it) => it.document);
    },
  };
}

function cosine(a: number[], b: number[]) {
  let p = 0;
  let p2 = 0;
  let q2 = 0;

  for (let i = 0; i < a.length; i++) {
    p += a[i] * b[i];
    p2 += a[i] * a[i];
    q2 += b[i] * b[i];
  }

  return p / (Math.sqrt(p2) * Math.sqrt(q2));
}

async function embed(input: string[]) {
  const response = await fetch('http://localhost:11434/api/embed', {
    method: 'POST',
    body: JSON.stringify({
      model: 'nomic-embed-text:latest',
      input,
    }),
  });

  if (!response.ok) {
    throw new Error('Query is not ok');
  }

  const { embeddings } = await response.json();

  return embeddings as number[][];
}
