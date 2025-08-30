import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GoogleTasksAuth } from '../auth.js';
import { validateTaskListId } from '../utils/validation.js';

export function createClearCompletedTools(auth: GoogleTasksAuth): Tool[] {
  return [
    {
      name: 'clear-completed-tasks',
      description: 'Clear all completed tasks from a task list',
      inputSchema: {
        type: 'object',
        properties: {
          tasklistId: {
            type: 'string',
            description: 'The ID of the task list to clear completed tasks from'
          }
        },
        required: ['tasklistId']
      }
    }
  ];
}

export async function handleClearCompletedTool(
  name: string,
  args: any,
  auth: GoogleTasksAuth
) {
  const tasks = await auth.getTasksClient();

  switch (name) {
    case 'clear-completed-tasks': {
      validateTaskListId(args.tasklistId);
      await tasks.tasks.clear({
        tasklist: args.tasklistId
      });
      return {
        content: [{
          type: 'text' as const,
          text: `All completed tasks cleared from task list ${args.tasklistId}`
        }]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}