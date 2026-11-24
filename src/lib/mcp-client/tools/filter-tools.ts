import { tools } from "../index";

interface ToolMetadata {
  keywords: string[];
  description: string;
}

const TOOL_METADATA: Record<string, ToolMetadata> = {
  list_builds: {
    keywords: ["show", "list", "all", "builds", "display", "get builds", "available"],
    description: "Lists all builds",
  },
  get_bundle_summary: {
    keywords: ["summary", "bundle", "analyze", "check", "size", "metrics", "analysis"],
    description: "Gets bundle analysis summary",
  },
  compare_builds: {
    keywords: ["compare", "vs", "diff", "difference", "between", "compare builds", "comparison"],
    description: "Compares two builds",
  },
};

type Tool = Awaited<ReturnType<typeof tools.listAvailableTools>>[number];

export function filterToolsByQuery(allTools: Tool[], userQuery: string): Tool[] {
  const queryLower = userQuery.toLowerCase();
  const matchedToolNames = new Set<string>();

  for (const [toolName, metadata] of Object.entries(TOOL_METADATA)) {
    const hasMatch = metadata.keywords.some((keyword) => queryLower.includes(keyword));

    if (hasMatch) {
      matchedToolNames.add(toolName);
    }
  }

  if (matchedToolNames.size === 0) {
    console.log("⚠️  No tools matched query, returning all tools as fallback");
    return allTools;
  }

  const filteredTools = allTools.filter((tool) => matchedToolNames.has(tool.name));

  console.log(`🎯 Filtered tools for query: ${Array.from(matchedToolNames).join(", ")}`);

  return filteredTools;
}
