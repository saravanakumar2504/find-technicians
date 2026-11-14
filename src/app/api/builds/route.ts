import { NextResponse } from "next/server";
import { mcpClient, tools, MCPLogMessage } from "@/lib/mcp-client";

/**
 * API Route: GET /api/builds
 * Fetches build information using MCP server
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get("project") || process.env.GITHUB_REPO || "find-technicians";

    // Array to collect logs during this request
    const logs: MCPLogMessage[] = [];

    // Register log callback to capture logs from MCP server
    const logCallback = (log: MCPLogMessage) => {
      logs.push(log);

      // Also process/display the log
      console.log(`📊 [Captured MCP Log]:`, JSON.parse(log.data));
    };

    mcpClient.onLog(logCallback);

    try {
      // Call MCP server tool
      const result = await tools.listBuilds(mcpClient, project);

      console.log("✅ API Route: MCP server responded successfully");

      return NextResponse.json({
        success: true,
        data: result,
        logs, // Include captured logs in response
      });
    } finally {
      // Clean up: remove log callback after request
      mcpClient.offLog(logCallback);
    }
  } catch (error: any) {
    console.error("❌ MCP Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
