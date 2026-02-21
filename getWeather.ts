import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'weather-server',
  version: '0.1.0',
});

server.registerTool(
  'get_weather',
  {
    description: 'Get weather for a given city',
    inputSchema: z.object({
      city: z.string(),
    }),
  },
  ({ city }): CallToolResult => ({
    content: [
      {
        type: 'text',
        text: `The weather in ${city} is always sunny!`,
      },
    ],
  }),
);

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('Weather MCP server running on stdio');
}

void main();
