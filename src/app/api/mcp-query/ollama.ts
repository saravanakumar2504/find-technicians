import ollama from "ollama";
import { tools } from "@/lib/mcp-client";

export interface OllamaToolCall {
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface OllamaResponse {
  message: {
    content?: string;
    tool_calls?: OllamaToolCall[];
  };
}

type Tool = Awaited<ReturnType<typeof tools.listAvailableTools>>[number];

/**
 * Convert MCP tool definitions to Ollama function calling format
 */
export function convertToolsToOllama(availableTools: Tool[]) {
  return availableTools.map((tool) => {
    const schema = tool.inputSchema as any;

    return {
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description || "",
        parameters: {
          type: "object",
          properties: schema.properties || {},
          required: schema.required || [],
        },
      },
    };
  });
}

/**
 * Call Ollama with function calling capabilities
 */
export async function callOllama(
  query: string,
  ollamaTools: ReturnType<typeof convertToolsToOllama>
): Promise<OllamaResponse> {
  const response = await ollama.chat({
    model: "qwen2.5:3b",
    messages: [
      {
        role: "system",
        content: "You are an assistant helping with the 'find-technicians' project. When the user asks about builds, use project='find-technicians'.",
      },
      {
        role: "user",
        content: query,
      },
    ],
    tools: ollamaTools,
  });

  return response as OllamaResponse;
}

/**
 * Check if Ollama response contains a tool call
 */
export function hasToolCall(response: OllamaResponse): boolean {
  return !!(response.message.tool_calls && response.message.tool_calls.length > 0);
}

/**
 * Extract the first tool call from Ollama response
 */
export function getFirstToolCall(response: OllamaResponse): OllamaToolCall | null {
  if (response.message.tool_calls && response.message.tool_calls.length > 0) {
    return response.message.tool_calls[0];
  }
  return null;
}
