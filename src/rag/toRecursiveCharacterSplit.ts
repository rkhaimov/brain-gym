import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from './types';

export async function toRecursiveCharacterSplit<T extends Document>(
  documents: T[],
): Promise<T[]> {
  const split = await new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  }).splitDocuments(
    documents.map((it) => ({
      pageContent: it.content,
      metadata: it,
    })),
  );

  return split.map((it) => it.metadata) as typeof documents;
}
