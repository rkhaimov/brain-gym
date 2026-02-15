import { ChatOpenAI } from '@langchain/openai';
import { createAgent, providerStrategy } from 'langchain';
import { z } from 'zod';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/streaming/overview
async function main() {
  const ContactInfo = z.object({
    name: z.string().describe('The name of the person'),
    email: z.string().describe('The email address of the person'),
    phone: z.string().describe('The phone number of the person'),
  });

  const model = new ChatOpenAI(CONNECTION_CONFIG);

  const agent = createAgent({
    model: model,
    responseFormat: providerStrategy(ContactInfo),
  });

  const result = await agent.invoke({
    messages: [
      {
        role: 'user',
        content:
          'Extract contact info from: John Doe, john@example.com, (555) 123-4567',
      },
    ],
  });

  console.log(result);
}
