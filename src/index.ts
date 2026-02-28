import { ChatOpenAI } from '@langchain/openai';
import {
  CompositeBackend,
  createDeepAgent,
  FileData,
  StateBackend,
  StoreBackend,
} from 'deepagents';
import { createMiddleware } from 'langchain';
import { CONNECTION_CONFIG } from './private';

// https://docs.langchain.com/oss/javascript/deepagents/overview
async function main() {
  function createFileData(content: string): FileData {
    const now = new Date().toISOString();
    return {
      content: content.split('\n'),
      created_at: now,
      modified_at: now,
    };
  }

  const skillsFiles: Record<string, FileData> = {};

  const skillUrl =
    'https://raw.githubusercontent.com/langchain-ai/deepagentsjs/refs/heads/main/examples/skills/langgraph-docs/SKILL.md';
  const response = await fetch(skillUrl);
  const skillContent = await response.text();

  skillsFiles['/skills/langgraph-docs/SKILL.md'] = createFileData(skillContent);

  const agent = createDeepAgent({
    model: new ChatOpenAI(CONNECTION_CONFIG),
    systemPrompt: 'You are helpful assistant',
    tools: [],
    middleware: [
      createMiddleware({
        name: 'debug',
        wrapToolCall: (request, handler) => {
          debugger;

          return handler(request);
        },
        wrapModelCall: (request, handler) => {
          debugger;

          return handler(request);
        },
      }),
    ],
    skills: ['/skills/'],
  });

  console.log(
    await agent.invoke({
      messages: [
        {
          role: 'user',
          content:
            'what is langraph? Use the langgraph-docs skill if available.',
        },
      ],
      files: skillsFiles,
    }),
  );
}

void main();
