import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { GoogleTasksAuth } from '../dist/auth.js';
import { createTaskListTools, handleTaskListTool } from '../dist/tools/tasklist-tools.js';
import { createTaskTools, handleTaskTool } from '../dist/tools/task-tools.js';
import { createClearCompletedTools, handleClearCompletedTool } from '../dist/tools/clear-completed-tools.js';
import { logger } from '../dist/utils/logger.js';

class GoogleTasksMCPHandler {
  constructor() {
    this.server = new Server(
      {
        name: 'google-tasks-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.auth = new GoogleTasksAuth();
    this.setupToolHandlers();
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
      } catch (error) {
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
        } else if (taskToolNames.includes(name)) {
          result = await handleTaskTool(name, args || {}, this.auth);
        } else if (clearCompletedToolNames.includes(name)) {
          result = await handleClearCompletedTool(name, args || {}, this.auth);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }

        logger.logToolResult(name, true);
        return result;
      } catch (error) {
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

  async handleRequest(request) {
    try {
      const { method, params } = request;
      
      if (method === 'tools/list') {
        const handler = this.server.getRequestHandler(ListToolsRequestSchema);
        return await handler({ method, params });
      } else if (method === 'tools/call') {
        const handler = this.server.getRequestHandler(CallToolRequestSchema);
        return await handler({ method, params });
      } else {
        throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}

let handler;

export default async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    if (!handler) {
      handler = new GoogleTasksMCPHandler();
    }

    const result = await handler.handleRequest(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}