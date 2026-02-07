import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/models#structured-output
async function main() {
  const model = new ChatOpenAI(CONNECTION_CONFIG).withStructuredOutput(
    z.object({
      title: z.string().describe('The title of the movie'),
      year: z.number().describe('The year the movie was released'),
      director: z.string().describe('The director of the movie'),
      rating: z.int().min(0).max(10).describe("The movie's rating"),
    }),
  );

  const start = performance.now();
  console.log(
    await model.invoke('Provide details about the movie Inception', {
      timeout: 30_000,
    }),
  );

  console.log(performance.now() - start);
}
