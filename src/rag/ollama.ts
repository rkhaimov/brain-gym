import { Either } from '../utils/Either';
import { assert } from '../utils/utils';
import { Embedding, EmbeddingModel } from './types';

export const ollama: EmbeddingModel = async (documents) => {
  const chunks = chunked(documents);

  if (chunks.length < 2) {
    return embed(documents);
  }

  const result: Embedding[] = [];
  for (const [index, chunk] of chunks.entries()) {
    console.log(`Embedding ${index}/${chunks.length}`);

    const embeddings = await embed(chunk);

    if (Either.isLeft(embeddings)) {
      return embeddings;
    }

    result.push(...embeddings.value);
  }

  return Either.right(result);
};

const embed: EmbeddingModel = async (documents) => {
  try {
    const response = await fetch('http://localhost:11434/api/embed', {
      method: 'POST',
      body: JSON.stringify({
        model: 'nomic-embed-text:latest',
        input: documents,
      }),
    });

    assert(response.ok, response.statusText);

    const { embeddings } = await response.json();

    return Either.right(embeddings as Embedding[]);
  } catch (error: unknown) {
    return Either.left({ kind: 'EmbeddingFailure', body: error });
  }
};

function chunked(documents: string[]): string[][] {
  return new Array(Math.ceil(documents.length / 5))
    .fill(null)
    .map((_, index) =>
      documents.slice(index * 5, Math.min((index + 1) * 5, documents.length)),
    );
}
