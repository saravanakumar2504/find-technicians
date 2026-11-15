import { BundleAnalysisClient } from "../index";

/**
 * Dynamically executes any MCP tool by name with provided arguments
 */
export async function executeTool(
  client: BundleAnalysisClient,
  toolName: string,
  args: Record<string, unknown>
) {
  await client.connect();

  const response = await client.getClient().callTool({
    name: toolName,
    arguments: args,
  });

  return response;
}
