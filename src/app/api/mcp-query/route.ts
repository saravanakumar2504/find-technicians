import { NextResponse } from "next/server";
import { mcpClient, tools, type MCPLogMessage } from "@/lib/mcp-client";
import { toolResponseCache } from "@/lib/cache/tool-response-cache";
import { convertToolsToOllama, callOllama, hasToolCall, getFirstToolCall } from "./ollama";

// Mark as dynamic since this is a POST API route
export const dynamic = 'force-dynamic';

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
    const ollamaTools = convertToolsToOllama(availableTools);

    // Step 3: Call Ollama with function calling
    const response = await callOllama(query, ollamaTools);
    console.log("🤖 Ollama response:", response);

    // Step 4: Check if Ollama wants to call a function
    if (!hasToolCall(response)) {
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
    const toolCall = getFirstToolCall(response)!;
    console.log(`🔧 Ollama selected tool: ${toolCall.function.name}`);
    console.log(`📦 Arguments:`, toolCall.function.arguments);

    const toolArgs = toolCall.function.arguments as Record<string, unknown>;

    // Step 5: Check cache before calling MCP
    let toolResult = toolResponseCache.get(toolCall.function.name, toolArgs);
    let cacheHit = false;

    if (toolResult) {
      cacheHit = true;
      console.log(`✅ Result retrieved from cache (no MCP call needed)`);
    } else {
      // Cache miss - call MCP tool
      toolResult = await tools.executeTool(
        mcpClient,
        toolCall.function.name,
        toolArgs
      );

      console.log("✅ Tool executed successfully");

      // Store result in cache (if tool is cacheable)
      toolResponseCache.set(toolCall.function.name, toolArgs, toolResult);
    }

    // Step 6: Return the result
    return NextResponse.json({
      success: true,
      data: {
        answer: `Tool executed: ${toolCall.function.name}`,
        toolCalled: {
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
          result: toolResult,
          fromCache: cacheHit,
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
