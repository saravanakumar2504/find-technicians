import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { LoggingMessageNotificationSchema } from "@modelcontextprotocol/sdk/types.js";

// Type definition for MCP log messages
export interface MCPLogMessage {
  level: "debug" | "info" | "notice" | "warning" | "error" | "critical" | "alert" | "emergency";
  data: string;
  timestamp: string;
}

// Type for log callback functions
export type LogCallback = (log: MCPLogMessage) => void;

/**
 * Manages logging for MCP client connections
 */
export class MCPLoggingManager {
  private logCallbacks: LogCallback[] = [];

  /**
   * Register a callback to receive log messages
   */
  onLog(callback: LogCallback): void {
    this.logCallbacks.push(callback);
  }

  /**
   * Remove a log callback
   */
  offLog(callback: LogCallback): void {
    this.logCallbacks = this.logCallbacks.filter((cb) => cb !== callback);
  }

  /**
   * Set up the notification handler for logging messages on the MCP client
   */
  setupLoggingHandler(client: Client): void {
    client.setNotificationHandler(
      LoggingMessageNotificationSchema,
      (notification) => {
        // Process the log message
        const logMessage: MCPLogMessage = {
          level: notification.params.level,
          data: notification.params.data as string,
          timestamp: new Date().toISOString(),
        };

        // Trigger all registered callbacks
        this.triggerCallbacks(logMessage);

        // Also log to console for visibility
        this.logToConsole(logMessage);
      }
    );
  }

  /**
   * Trigger all registered log callbacks
   */
  private triggerCallbacks(logMessage: MCPLogMessage): void {
    this.logCallbacks.forEach((callback) => callback(logMessage));
  }

  /**
   * Log message to console with formatting
   */
  private logToConsole(logMessage: MCPLogMessage): void {
    // console.log(`📋 [MCP Log - ${logMessage.level}]:`, logMessage.data);
  }

  /**
   * Clear all registered callbacks
   */
  clearCallbacks(): void {
    this.logCallbacks = [];
  }
}
