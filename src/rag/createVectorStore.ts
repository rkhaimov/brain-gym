import { Either } from '../utils/Either';
import { isNil } from '../utils/utils';
import { Document, Embedding, EmbeddingFailure, EmbeddingModel } from './types';

export type VectorStore<T extends Document> = {
  add(documents: T[]): Promise<Either<EmbeddingFailure, VectorStore<T>>>;
  search(
    query: string,
    config: { k: number },
  ): Promise<Either<EmbeddingFailure, T[]>>;
};

export function createVectorStore<T extends Document>(
  embed: EmbeddingModel,
): VectorStore<T> {
  const store: EmbeddedDocument[] = [];

  const instance: VectorStore<T> = {
    add: async (documents) => {
      const embeddings = await embed(documents.map((it) => it.content));

      if (Either.isLeft(embeddings)) {
        return embeddings;
      }

      if (embeddings.value.length !== documents.length) {
        return Either.left({
          kind: 'EmbeddingFailure',
          body: 'Embedding does not match documents length',
        });
      }

      store.push(
        ...embeddings.value.map((embedding, index) => ({
          embedding,
          document: documents[index]!,
        })),
      );

      return Either.right(instance);
    },
    search: async (query, { k }) => {
      const embedded = await embed([query]);

      if (Either.isLeft(embedded)) {
        return embedded;
      }

      const [_query] = embedded.value;

      if (isNil(_query)) {
        return Either.left({
          kind: 'EmbeddingFailure',
          body: 'Embedding does not match documents length',
        });
      }

      const found = store
        .map((it) => ({
          it,
          similarity: cosine(_query, it.embedding),
        }))
        .sort((a, b) => (a.similarity > b.similarity ? -1 : 1))
        .slice(0, k)
        .map(({ it }) => it.document as T);

      return Either.right(found);
    },
  };

  return instance;
}

function cosine(a: Embedding, b: Embedding) {
  let p = 0;
  let p2 = 0;
  let q2 = 0;

  for (let i = 0; i < a.length; i++) {
    p += a[i]! * b[i]!;
    p2 += a[i]! * a[i]!;
    q2 += b[i]! * b[i]!;
  }

  return p / (Math.sqrt(p2) * Math.sqrt(q2));
}

type EmbeddedDocument = {
  document: Document;
  embedding: Embedding;
};
