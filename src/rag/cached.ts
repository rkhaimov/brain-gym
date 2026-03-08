import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import { Either } from '../utils/Either';
import { Embedding, EmbeddingModel } from './types';

export function cached(model: EmbeddingModel): EmbeddingModel {
  return async (documents) => {
    if (documents.length < 2) {
      return model(documents);
    }

    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(documents))
      .digest('hex');

    if (
      await fs
        .access(`./ignored/${hash}.json`)
        .then(() => true)
        .catch(() => false)
    ) {
      const embeddings: Embedding[] = JSON.parse(
        (await fs.readFile(`./ignored/${hash}.json`)).toString(),
      );

      return Either.right(embeddings);
    }

    const result = await model(documents);

    if (Either.isLeft(result)) {
      return result;
    }

    await fs.writeFile(`./ignored/${hash}.json`, JSON.stringify(result.value));

    return result;
  };
}
