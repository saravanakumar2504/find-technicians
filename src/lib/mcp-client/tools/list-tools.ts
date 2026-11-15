import { BundleAnalysisClient } from "../index";

/**
 * Lists all available tools from the MCP server
 * Returns tool schemas that can be passed to an LLM
 */
export async function listAvailableTools(client: BundleAnalysisClient) {
  await client.connect();

  const response = await client.getClient().listTools();

  return response.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));
}
