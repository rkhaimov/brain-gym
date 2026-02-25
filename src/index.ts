import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { ChatOpenAI, tools } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { tool, createAgent } from 'langchain';
import { z } from 'zod';
import { createSearcher } from './createSearcher';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/rag
async function main() {
  const documents = await new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  }).splitDocuments(
    await new CheerioWebBaseLoader('https://docusaurus.io/docs', {
      selector: 'p',
    }).load(),
  );

  const searcher = await createSearcher(
    documents.map((it) => it.pageContent),
    { k: 5 },
  );

  const model = new ChatOpenAI(CONNECTION_CONFIG);

  const agent = createAgent({
    model,
    tools: [
      tool(
        async (arg) => {
          console.log(arg);

          const docs = await searcher.search((arg as any).keywords.join(' '));

          return docs.join('\n');
        },
        {
          name: 'retrieve',
          description:
            'Retrieve information related to a query using keywords search.',
          schema: z.object({ keywords: z.array(z.string()) }),
        },
      ),
    ],
  });

  const response = await agent.invoke({
    messages: [
      {
        role: 'system',
        content:
          'You have access to a tool that retrieves context from documentation page. ' +
          'Use the tool to help answer user queries.' +
          'Answer solely based on querying results.',
      },
      {
        role: 'human',
        content:
          'What is Docusaurus and which benefits it has? Answer short with bullet list with emojis',
      },
    ],
  });

  console.log(response.messages.at(-1)?.text);
}
