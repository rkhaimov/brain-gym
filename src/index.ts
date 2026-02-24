import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { ChatOpenAI } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { z } from 'zod';
import { createSearcher } from './createSearcher';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/rag
async function main() {
  const docs = await new PDFLoader('./nke-10k-2023.pdf').load();

  const splits = await new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  }).splitDocuments(docs);

  const searcher = await createSearcher(
    splits.map((it) => it.pageContent),
    { k: 3 },
  );

  const model = new ChatOpenAI(CONNECTION_CONFIG);

  const question = "How were Nike's margins impacted in 2023?";

  const rewrite = await model
    .withStructuredOutput(z.object({ query: z.string() }))
    .invoke([
      {
        role: 'system',
        content: `Rewrite this query to retrieve relevant information. The knowledge base contains annual report on form 10-K for nike inc`,
      },
      {
        role: 'human',
        content: question,
      },
    ]);

  const context = await searcher.search(rewrite.query);

  const response = await model.invoke([
    {
      role: 'human',
      content: `Question: ${question}\n\nAnswer solely based on:\n${context.join('\n\n')}`,
    },
  ]);

  console.log(context);

  console.log(response.text);
}
