#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { GoogleTasksAuth } from './auth.js';
import { createTaskListTools, handleTaskListTool } from './tools/tasklist-tools.js';
import { createTaskTools, handleTaskTool } from './tools/task-tools.js';
import { createClearCompletedTools, handleClearCompletedTool } from './tools/clear-completed-tools.js';
import { logger } from './utils/logger.js';
class GoogleTasksMCPServer {
    server;
    auth;
    constructor() {
        try {
            logger.info('Initializing Google Tasks MCP Server');
            this.server = new Server({
                name: 'google-tasks-mcp-server',
                version: '1.0.0',
            }, {
                capabilities: {
                    tools: {},
                },
            });
            this.auth = new GoogleTasksAuth();
            this.setupToolHandlers();
            logger.info('Server initialization completed');
        }
        catch (error) {
            logger.error('Failed to initialize server', error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            try {
                logger.logRequest('tools/list');
                const taskListTools = createTaskListTools(this.auth);
                const taskTools = createTaskTools(this.auth);
                const clearCompletedTools = createClearCompletedTools(this.auth);
                const result = {
                    tools: [
                        ...taskListTools,
                        ...taskTools,
                        ...clearCompletedTools
                    ]
                };
                logger.logResponse('tools/list', true);
                return result;
            }
            catch (error) {
                logger.logResponse('tools/list', false, error instanceof Error ? error : new Error(String(error)));
                throw error;
            }
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                logger.logToolCall(name, args || {});
                const taskListToolNames = ['list-tasklists', 'get-tasklist', 'create-tasklist', 'update-tasklist', 'delete-tasklist'];
                const taskToolNames = ['list-tasks', 'get-task', 'create-task', 'update-task', 'delete-task', 'complete-task', 'move-task'];
                const clearCompletedToolNames = ['clear-completed-tasks'];
                let result;
                if (taskListToolNames.includes(name)) {
                    result = await handleTaskListTool(name, args || {}, this.auth);
                }
                else if (taskToolNames.includes(name)) {
                    result = await handleTaskTool(name, args || {}, this.auth);
                }
                else if (clearCompletedToolNames.includes(name)) {
                    result = await handleClearCompletedTool(name, args || {}, this.auth);
                }
                else {
                    throw new Error(`Unknown tool: ${name}`);
                }
                logger.logToolResult(name, true);
                return result;
            }
            catch (error) {
                const toolError = error instanceof Error ? error : new Error(String(error));
                logger.logToolResult(name, false, toolError);
                return {
                    content: [{
                            type: 'text',
                            text: `Error: ${toolError.message}`
                        }],
                    isError: true
                };
            }
        });
    }
    async run() {
        try {
            logger.info('Starting MCP server connection');
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            logger.info('Google Tasks MCP Server running on stdio');
            console.error('Google Tasks MCP Server running on stdio');
        }
        catch (error) {
            logger.error('Failed to start MCP server', error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
}
// Global error handlers
process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('Unhandled promise rejection', error);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('Received SIGTERM signal, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger.info('Received SIGINT signal, shutting down gracefully');
    process.exit(0);
});
// Export handler for Vercel
export default async function handler(_req, res) {
    try {
        // For Vercel, we'll return server info instead of running stdio
        res.status(200).json({
            name: 'google-tasks-mcp-server',
            version: '1.0.0',
            status: 'running',
            message: 'Google Tasks MCP Server is available'
        });
    }
    catch (error) {
        logger.error('Handler error', error instanceof Error ? error : new Error(String(error)));
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : String(error)
        });
    }
}
// Keep the original server code for local development
if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('index.js')) {
    try {
        const server = new GoogleTasksMCPServer();
        server.run().catch((error) => {
            logger.error('Server run failed', error);
            console.error('Server run failed:', error);
            process.exit(1);
        });
    }
    catch (error) {
        logger.error('Failed to create server instance', error instanceof Error ? error : new Error(String(error)));
        console.error('Failed to create server instance:', error);
        process.exit(1);
    }
}
