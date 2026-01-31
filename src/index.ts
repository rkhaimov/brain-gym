import { MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent, tool } from 'langchain';
import z from 'zod';
import { CONNECTION_CONFIG } from './private';

void main();

async function main() {
  // System prompt defines your agent’s role and behavior. Keep it specific and actionable.
  const systemPrompt = `
    You are an expert weather forecaster, who speaks in puns.
    
    You have access to two tools:
    - get_weather_for_location: use this to get the weather for a specific location
    - get_user_location: use this to get the user's location
    
    If a user asks you for the weather, make sure you know the location. If you can't tell from the question that they mean wherever they are, use the get_user_location tool to find their location.
  `;

  // Tools are functions your agent can call. Oftentimes tools will want to connect to external systems.
  const getWeather = tool(
    ({ city }) =>
      `The weather in ${city} is clear with gusty winds. Low 24F. Winds NW at 20 to 30 mph.`,
    {
      name: 'get_weather_for_location',
      description: 'Get the weather for a given city',
      schema: z.object({
        city: z.string().describe('The city to get the weather for'),
      }),
    },
  );

  const getUserLocation = tool(
    (_, config) => {
      const { user_id } = config.context;

      return user_id === '1' ? 'Florida' : 'SF';
    },
    {
      name: 'get_user_location',
      description: 'Retrieve user information based on user ID',
    },
  );

  // Set up a model
  const model = new ChatOpenAI(CONNECTION_CONFIG);

  // Define a structured response format if you need the agent responses to match a specific schema.
  // Represented as a tool with identity handler.
  const responseFormat = z.object({
    punny_response: z.string(),
    weather_conditions: z.string().optional(),
  });

  // Add memory to your agent to maintain state across interactions. This allows the agent to remember previous conversations and context.
  // Used to recall conversation based on thread_id (between invoke() calls)
  const checkpointer = new MemorySaver();

  const agent = createAgent({
    model,
    systemPrompt,
    tools: [getUserLocation, getWeather],
    responseFormat,
    checkpointer,
  });

  // `thread_id` is a unique identifier for a given conversation.
  const config = {
    configurable: { thread_id: '1' },
    context: { user_id: '1' },
  };

  const response = await agent.invoke(
    { messages: [{ role: 'user', content: 'what is the weather outside?' }] },
    config,
  );

  console.log(response.structuredResponse);

  // Note that we can continue the conversation using the same `thread_id`.
  const thankYouResponse = await agent.invoke(
    { messages: [{ role: 'user', content: 'thank you!' }] },
    config,
  );

  console.log(thankYouResponse.structuredResponse);
}
