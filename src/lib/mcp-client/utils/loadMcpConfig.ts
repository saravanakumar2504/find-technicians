import path from "path";
import fs from "fs";

export function loadMcpConfig() {
  const configPath = path.join(process.cwd(), ".mcp.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(
      ".mcp.json not found. Create it from .mcp.json.example with your server path.",
    );
  }
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  const serverConfig = config.mcpServers?.["bundle-analysis"];

  if (!serverConfig) {
    throw new Error("bundle-analysis server not configured in .mcp.json");
  }

  return serverConfig;
}