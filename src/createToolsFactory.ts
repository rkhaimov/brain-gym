import { ToolsFactory } from './core/invoke';
import { Tool } from './core/tool';

export function createToolsFactory(tools: Tool[]): ToolsFactory {
  return () => new Map(tools.map((tool) => [tool.meta.function.name, tool]));
}
