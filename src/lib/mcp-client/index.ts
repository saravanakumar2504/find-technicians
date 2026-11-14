import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { config as dotenvConfig } from "dotenv";

import { loadMcpConfig, MCPLoggingManager, type MCPLogMessage, type LogCallback } from "./utils";
import * as tools from "./tools";

// Load .env file if not already loaded (for non-Next.js contexts)
if (!process.env.GITHUB_TOKEN) {
  dotenvConfig();
}

export class BundleAnalysisClient {
  private client: Client;
  private transport: StdioClientTransport;
  private connected = false;
  private loggingManager: MCPLoggingManager;

  constructor() {
    this.client = new Client(
      {
        name: "find-technicians-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      },
    );

    // Initialize logging manager
    this.loggingManager = new MCPLoggingManager();

    // Load server config from .mcp.json
    const serverConfig = loadMcpConfig();

    // Prepare environment variables for MCP server
    const mcpEnv = {
      ...process.env,
      ...serverConfig.env,
    };

    this.transport = new StdioClientTransport({
      command: serverConfig.command,
      args: serverConfig.args,
      env: mcpEnv,
    });
  }

  async connect() {
    if (this.connected) return;

    await this.client.connect(this.transport);

    // Set up logging handler
    this.loggingManager.setupLoggingHandler(this.client);

    this.connected = true;
    console.log("✅ Connected to bundle-analysis MCP server");
  }

  // Register a callback to receive log messages
  onLog(callback: LogCallback) {
    this.loggingManager.onLog(callback);
  }

  // Remove a log callback
  offLog(callback: LogCallback) {
    this.loggingManager.offLog(callback);
  }

  getClient(): Client {
    return this.client;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async disconnect() {
    if (this.connected) {
      await this.client.close();
      this.loggingManager.clearCallbacks();
      this.connected = false;
    }
  }
}

// Export singleton instance
export const mcpClient = new BundleAnalysisClient();

// Export tools for direct use
export { tools };

// Re-export types from utils for convenience
export type { MCPLogMessage, LogCallback };
