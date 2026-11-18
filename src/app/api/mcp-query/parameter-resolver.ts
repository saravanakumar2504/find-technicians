import { tools } from "@/lib/mcp-client";

type Tool = Awaited<ReturnType<typeof tools.listAvailableTools>>[number];

const TOOL_PARAMETER_DEFAULTS: Record<string, Record<string, any>> = {
  list_builds: {
    project: "find-technicians"
  },
};

/**
 * Resolve tool parameters by applying defaults from schema and configuration
 */
export function resolveToolParameters(
  toolArgs: Record<string, unknown>,
  selectedTool: Tool,
  toolName: string
): Record<string, unknown> {
  const schema = selectedTool.inputSchema as any;
  const properties = schema.properties || {};
  const configuredDefaults = TOOL_PARAMETER_DEFAULTS[toolName] || {};

  // Apply defaults for any missing/null parameters
  Object.entries(properties).forEach(([key, propSchema]: [string, any]) => {
    if (toolArgs[key] === undefined || toolArgs[key] === null) {
      // First check configured defaults, then schema defaults
      const defaultValue = configuredDefaults[key] ?? propSchema.default;
      if (defaultValue !== undefined) {
        console.log(`⚠️  Parameter "${key}" missing, using default: ${defaultValue}`);
        toolArgs[key] = defaultValue;
      }
    }
  });

  return toolArgs;
}
