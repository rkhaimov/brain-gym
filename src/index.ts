import { ChatOpenAI } from '@langchain/openai';
import { createAgent, HumanMessage, tool } from 'langchain';
import { z } from 'zod';
import { CONNECTION_CONFIG } from './private';

const ALLOWED_HOSTS = ['docs.langchain.com'];
const LLMS_TXT = 'https://langchain-ai.github.io/langgraph/llms.txt';

// https://docs.langchain.com/oss/javascript/langchain/rag
async function main() {
  const fetchDocumentation = tool(
    async (input) => {
      if (!ALLOWED_HOSTS.includes(new URL(input.url).host)) {
        return `Error: host is not allowed. Must be one of: ${ALLOWED_HOSTS.join(', ')}`;
      }

      const response = await fetch(input.url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.text();
    },
    {
      name: 'fetch_documentation',
      description: 'Fetch and convert documentation from a URL',
      schema: z.object({
        url: z.string().describe('The URL of the documentation to fetch'),
      }),
    },
  );

  const llmsTxtResponse = await fetch(LLMS_TXT);
  const llmsTxtContent = await llmsTxtResponse.text();

  const systemPrompt = `
  You are an expert TypeScript developer and technical assistant.
  Your primary role is to help users with questions about LangGraph and related tools.
  
  Instructions:
  
  1. If a user asks a question you're unsure about — or one that likely involves API usage,
     behavior, or configuration — you MUST use the \`fetch_documentation\` tool to consult the relevant docs.
  2. When citing documentation, summarize clearly and include relevant context from the content.
  3. Do not use any URLs outside of the allowed domain.
  4. If a documentation fetch fails, tell the user and proceed with your best expert understanding.
  
  You can access official documentation from the following approved sources:
  
  ${llmsTxtContent}
  
  You MUST consult the documentation to get up to date documentation
  before answering a user's question about LangGraph.
  
  Your answers should be clear, concise, and technically accurate.
  `;

  const agent = createAgent({
    model: new ChatOpenAI(CONNECTION_CONFIG),
    tools: [fetchDocumentation],
    systemPrompt,
  });

  const response = await agent.invoke({
    messages: [
      new HumanMessage(
        'Write a short example of a langgraph agent using the ' +
          'prebuilt create react agent. the agent should be able ' +
          'to look up stock pricing information.',
      ),
    ],
  });

  console.log(response.messages);
}

void main();
