import type { BundleAnalysisClient } from "../index";

/**
 * List build reports and commit IDs
 * @param mcpClient - MCP client instance
 * @param project - Project name to list builds for
 * @returns Build list result from MCP server
 */
export async function listBuilds(mcpClient: BundleAnalysisClient, project: string) {
  if (!mcpClient.isConnected()) {
    await mcpClient.connect();
  }

  const result = await mcpClient.getClient().callTool({
    name: "list_builds",
    arguments: { project },
  });

  return result;
}
