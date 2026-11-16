import { NextResponse } from "next/server";
import { mcpClient, tools, type MCPLogMessage } from "@/lib/mcp-client";
import ollama from "ollama";

// Mark as dynamic since this is a POST API route
export const dynamic = 'force-dynamic';

/**
 * Configuration for tool parameter defaults
 * Add entries here to provide default values for any tool's parameters
 */
const TOOL_PARAMETER_DEFAULTS: Record<string, Record<string, any>> = {
  list_builds: {
    project: "find-technicians"
  },
  // Add more tools and their default parameters here as needed
  // example_tool: {
  //   param1: "default_value",
  //   param2: 123
  // }
};

/**
 * API Route: POST /api/mcp-query
 * Simple flow: User query → Ollama (Llama 3.1) picks tool → Execute → Return result
 *
 * Uses FREE local Ollama instead of paid cloud APIs
 */
export async function POST(request: Request) {
  const mcpLogs: MCPLogMessage[] = [];

  // Set up MCP log listener
  const logCallback = (logMessage: MCPLogMessage) => {
    console.log("📨 MCP Log:", logMessage);
    mcpLogs.push(logMessage);
  };

  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    console.log("📥 User query:", query);

    // Start listening to MCP logs
    mcpClient.onLog(logCallback);

    // Step 1: Get available tools from MCP server
    const availableTools = await tools.listAvailableTools(mcpClient);
    console.log("📋 Available tools:", availableTools.map(t => t.name));

    // Step 2: Convert MCP tools to Ollama function format
    const ollamaTools = availableTools.map((tool) => {
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

    console.log("🛠 Ollama tools schema:", ollamaTools.map(t => t.function.name));

    // Step 3: Call Ollama with function calling
    const response = await ollama.chat({
      model: "qwen2.5:3b", // Free local model with function calling (switch to llama3.1:8b once downloaded)
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
      tools: ollamaTools,
    });

    console.log("🤖 Ollama response:", response);

    // Step 4: Check if Ollama wants to call a function
    if (!response.message.tool_calls || response.message.tool_calls.length === 0) {
      console.log("ℹ️ No function call detected in Ollama response");
      // No function call - just return the text response
      return NextResponse.json({
        success: true,
        data: {
          answer: response.message.content || "No response generated",
          toolCalled: null,
          availableTools: availableTools.map(t => t.name),
          mcpLogs: mcpLogs,
        },
      });
    }

    // Step 5: Execute the first tool Ollama selected
    const toolCall = response.message.tool_calls[0];
    console.log(`🔧 Ollama selected tool: ${toolCall.function.name}`);
    console.log(`📦 Arguments (raw):`, toolCall.function.arguments);

    // Prepare arguments with defaults for missing required parameters
    let toolArgs = toolCall.function.arguments as Record<string, unknown>;

    // Generic default value injection - uses both schema defaults and configured defaults
    const selectedTool = availableTools.find(t => t.name === toolCall.function.name);
    if (selectedTool) {
      const schema = selectedTool.inputSchema as any;
      const properties = schema.properties || {};
      const configuredDefaults = TOOL_PARAMETER_DEFAULTS[toolCall.function.name] || {};

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
    }

    console.log(`📦 Arguments (final):`, toolArgs);

    const toolResult = await tools.executeTool(
      mcpClient,
      toolCall.function.name,
      toolArgs
    );

    console.log("✅ Tool executed successfully");

    // Step 6: Return the result
    return NextResponse.json({
      success: true,
      data: {
        answer: `Tool executed: ${toolCall.function.name}`,
        toolCalled: {
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
          result: toolResult,
        },
        availableTools: availableTools.map(t => t.name),
        mcpLogs: mcpLogs, // Include MCP logs in response
      },
    });

  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        mcpLogs: mcpLogs, // Include logs even on error for debugging
      },
      { status: 500 }
    );
  } finally {
    // Clean up log listener
    mcpClient.offLog(logCallback);
  }
}
