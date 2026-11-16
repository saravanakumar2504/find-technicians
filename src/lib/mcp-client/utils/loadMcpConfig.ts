import path from "path";
import fs from "fs";

export function loadMcpConfig() {
  const configPath = path.join(process.cwd(), ".mcp.json");

  if (!fs.existsSync(configPath)) {
    // Return dummy config for build-time (CI/CD)
    console.warn("⚠️  .mcp.json not found, using dummy config for build");
    return {
      command: "node",
      args: [],
      env: {},
    };
  }
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  const serverConfig = config.mcpServers?.["bundle-analysis"];

  if (!serverConfig) {
    // Return dummy config if server not configured
    console.warn("⚠️  bundle-analysis server not configured, using dummy config");
    return {
      command: "node",
      args: [],
      env: {},
    };
  }

  return serverConfig;
}