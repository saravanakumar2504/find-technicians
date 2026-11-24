import { NextResponse } from "next/server";
import { mcpClient, tools, type MCPLogMessage } from "@/lib/mcp-client";
import { toolResponseCache } from "@/lib/cache/tool-response-cache";
import { convertToolsToOllama, callOllama, hasToolCall, getFirstToolCall } from "./ollama";

// Mark as dynamic since this is a POST API route
export const dynamic = 'force-dynamic';

/**
 * Event types for streaming progress updates
 */
type ProgressEvent =
  | { type: 'available_tools'; data: { tools: string[] } }
  | { type: 'filtered_tools'; data: { tools: string[]; query: string } }
  | { type: 'ollama_thinking'; data: { message: string } }
  | { type: 'tool_selected'; data: { toolName: string; arguments: Record<string, unknown> } }
  | { type: 'tool_executing'; data: { toolName: string; fromCache: boolean } }
  | { type: 'tool_result'; data: { toolName: string; result: any; fromCache: boolean } }
  | { type: 'complete'; data: { answer: string; toolCalled: any; availableTools: string[]; mcpLogs: MCPLogMessage[] } }
  | { type: 'error'; data: { error: string; mcpLogs: MCPLogMessage[] } };

/**
 * Helper to send SSE event
 */
function sendEvent(controller: ReadableStreamDefaultController, event: ProgressEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  controller.enqueue(new TextEncoder().encode(data));
}

/**
 * API Route: POST /api/mcp-query
 * Streams progress updates as Server-Sent Events (SSE)
 *
 * Flow with streaming updates:
 * 1. Available tools → UI shows all tools
 * 2. Filtered tools → UI shows matched tools
 * 3. Ollama thinking → UI shows LLM is processing
 * 4. Tool selected → UI shows which tool and arguments
 * 5. Tool executing → UI shows execution (cached or fresh)
 * 6. Tool result → UI shows the result
 * 7. Complete → Final response with all data
 */
export async function POST(request: Request) {
  const { query } = await request.json();

  if (!query) {
    return NextResponse.json(
      { success: false, error: "Query is required" },
      { status: 400 }
    );
  }

  const mcpLogs: MCPLogMessage[] = [];

  // Set up MCP log listener
  const logCallback = (logMessage: MCPLogMessage) => {
    console.log("📨 MCP Log:", logMessage);
    mcpLogs.push(logMessage);
  };

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log("📥 User query:", query);
        mcpClient.onLog(logCallback);

        // ✅ STAGE 1: Get available tools
        const availableTools = await tools.listAvailableTools(mcpClient);
        console.log("📋 Available tools:", availableTools.map(t => t.name));
        sendEvent(controller, {
          type: 'available_tools',
          data: { tools: availableTools.map(t => t.name) }
        });

        // ✅ STAGE 2: Filter tools based on query
        const filteredTools = tools.filterToolsByQuery(availableTools, query);
        console.log("🎯 Filtered tools:", filteredTools.map(t => t.name));
        sendEvent(controller, {
          type: 'filtered_tools',
          data: { tools: filteredTools.map(t => t.name), query }
        });

        // ✅ STAGE 3: Ollama is thinking
        const ollamaTools = convertToolsToOllama(filteredTools);
        sendEvent(controller, {
          type: 'ollama_thinking',
          data: { message: 'Analyzing query and selecting best tool...' }
        });

        const response = await callOllama(query, ollamaTools);
        console.log("🤖 Ollama response:", response);

        // Check if Ollama wants to call a function
        if (!hasToolCall(response)) {
          console.log("ℹ️ No function call detected in Ollama response");
          sendEvent(controller, {
            type: 'complete',
            data: {
              answer: response.message.content || "No response generated",
              toolCalled: null,
              availableTools: availableTools.map(t => t.name),
              mcpLogs: mcpLogs,
            }
          });
          controller.close();
          return;
        }

        // ✅ STAGE 4: Tool selected by Ollama
        const toolCall = getFirstToolCall(response)!;
        console.log(`🔧 Ollama selected tool: ${toolCall.function.name}`);
        console.log(`📦 Arguments:`, toolCall.function.arguments);

        const toolArgs = toolCall.function.arguments as Record<string, unknown>;
        sendEvent(controller, {
          type: 'tool_selected',
          data: { toolName: toolCall.function.name, arguments: toolArgs }
        });

        // ✅ STAGE 5: Check cache and execute tool
        let toolResult = toolResponseCache.get(toolCall.function.name, toolArgs);
        let cacheHit = false;

        if (toolResult) {
          cacheHit = true;
          console.log(`✅ Result retrieved from cache (no MCP call needed)`);
          sendEvent(controller, {
            type: 'tool_executing',
            data: { toolName: toolCall.function.name, fromCache: true }
          });
        } else {
          sendEvent(controller, {
            type: 'tool_executing',
            data: { toolName: toolCall.function.name, fromCache: false }
          });

          // Cache miss - call MCP tool
          toolResult = await tools.executeTool(
            mcpClient,
            toolCall.function.name,
            toolArgs
          );

          console.log("✅ Tool executed successfully");

          // Store result in cache
          toolResponseCache.set(toolCall.function.name, toolArgs, toolResult);
        }

        // ✅ STAGE 6: Tool result
        sendEvent(controller, {
          type: 'tool_result',
          data: { toolName: toolCall.function.name, result: toolResult, fromCache: cacheHit }
        });

        // ✅ STAGE 7: Complete
        sendEvent(controller, {
          type: 'complete',
          data: {
            answer: `Tool executed: ${toolCall.function.name}`,
            toolCalled: {
              name: toolCall.function.name,
              arguments: toolCall.function.arguments,
              result: toolResult,
              fromCache: cacheHit,
            },
            availableTools: availableTools.map(t => t.name),
            mcpLogs: mcpLogs,
          }
        });

        controller.close();

      } catch (error: any) {
        console.error("❌ Error:", error);
        sendEvent(controller, {
          type: 'error',
          data: { error: error.message, mcpLogs: mcpLogs }
        });
        controller.close();
      } finally {
        mcpClient.offLog(logCallback);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
