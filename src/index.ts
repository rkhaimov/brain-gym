import { ChatOpenAI } from '@langchain/openai';
import { TavilySearch } from '@langchain/tavily';
import { createDeepAgent } from 'deepagents';
import { createMiddleware, tool } from 'langchain';
import { z } from 'zod';
import { CONNECTION_CONFIG, TAVILY_API_KEY } from './private';

// https://docs.langchain.com/oss/javascript/deepagents/overview
async function main() {
  const schema = z.object({
    query: z.string().describe('The search query'),
    maxResults: z
      .number()
      .optional()
      .default(5)
      .describe('Maximum number of results to return'),
    topic: z
      .enum(['general', 'news', 'finance'])
      .optional()
      .default('general')
      .describe('Search topic category'),
    includeRawContent: z
      .boolean()
      .optional()
      .default(false)
      .describe('Whether to include raw content'),
  });

  const agent = createDeepAgent({
    model: new ChatOpenAI(CONNECTION_CONFIG),
    systemPrompt: `You are an expert researcher.
    
    Your job is to conduct thorough research and then write a polished report.
    You have access to an internet search tool as your primary means of gathering information.

    ## \`internet_search\`

    Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
    `,
    tools: [
      tool(
        async ({
          query,
          maxResults = 5,
          topic = 'general',
          includeRawContent = false,
        }: z.Infer<typeof schema>) => {
          return new TavilySearch({
            maxResults,
            tavilyApiKey: TAVILY_API_KEY,
            includeRawContent,
            topic,
          })._call({ query });
        },
        {
          name: 'internet_search',
          description: 'Run a web search',
          schema,
        },
      ),
    ],
    middleware: [
      createMiddleware({
        name: 'debug',
        wrapToolCall: (request, handler) => {
          console.log(request.toolCall.name);
          console.log(request.toolCall.args);

          return handler(request);
        },
        wrapModelCall: (request, handler) => {
          return handler(request);
        },
      }),
    ],
  });

  console.log(
    await agent.invoke({
      messages: [
        {
          role: 'user',
          content: 'What is langgraph?',
        },
      ],
    }),
  );
}

void main();
