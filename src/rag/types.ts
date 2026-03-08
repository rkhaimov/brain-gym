import { Either } from '../utils/Either';
import { Failure } from '../utils/Failure';
import { Brand } from '../utils/utils';

export type EmbeddingModel = (
  documents: string[],
) => Promise<Either<EmbeddingFailure, Embedding[]>>;

export type EmbeddingFailure = Failure<'EmbeddingFailure', unknown>;

export type Embedding = Brand<number[], 'Embedding'>;

export type Document = {
  content: string;
};
