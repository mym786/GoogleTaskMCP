import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GoogleTasksAuth } from '../auth.js';
import { validateTaskListId, validateTaskId, validateTitle, validateDateFormat, validateStatus } from '../utils/validation.js';

export function createTaskTools(auth: GoogleTasksAuth): Tool[] {
  return [
    {
      name: 'list-tasks',
      description: 'List all tasks in a task list',
      inputSchema: {
        type: 'object',
        properties: {
          tasklistId: {
            type: 'string',
            description: 'The ID of the task list to get tasks from'
          },
          showCompleted: {
            type: 'boolean',
            description: 'Whether to include completed tasks (default: false)',
            default: false
          },
          showHidden: {
            type: 'boolean',
            description: 'Whether to include hidden tasks (default: false)',
            default: false
          }
        },
        required: ['tasklistId']
      }
    },
    {
      name: 'get-task',
      description: 'Get details about a specific task',
      inputSchema: {
        type: 'object',
        properties: {
          tasklistId: {
            type: 'string',
            description: 'The ID of the task list containing the task'
          },
          taskId: {
            type: 'string',
            description: 'The ID of the task to retrieve'
          }
        },
        required: ['tasklistId', 'taskId']
      }
    },
    {
      name: 'create-task',
      description: 'Create a new task',
      inputSchema: {
        type: 'object',
        properties: {
          tasklistId: {
            type: 'string',
            description: 'The ID of the task list to add the task to'
          },
          title: {
            type: 'string',
            description: 'The title of the new task'
          },
          notes: {
            type: 'string',
            description: 'Notes for the task (optional)'
          },
          due: {
            type: 'string',
            description: 'Due date in RFC 3339 format (optional)'
          },
          parent: {
            type: 'string',
            description: 'Parent task identifier for creating subtasks (optional)'
          },
          previous: {
            type: 'string',
            description: 'Previous sibling task identifier for positioning (optional)'
          }
        },
        required: ['tasklistId', 'title']
      }
    },
    {
      name: 'update-task',
      description: 'Update an existing task',
      inputSchema: {
        type: 'object',
        properties: {
          tasklistId: {
            type: 'string',
            description: 'The ID of the task list containing the task'
          },
          taskId: {
            type: 'string',
            description: 'The ID of the task to update'
          },
          title: {
            type: 'string',
            description: 'The new title for the task (optional)'
          },
          notes: {
            type: 'string',
            description: 'The new notes for the task (optional)'
          },
          due: {
            type: 'string',
            description: 'New due date in RFC 3339 format (optional)'
          },
          status: {
            type: 'string',
            enum: ['needsAction', 'completed'],
            description: 'The status of the task (optional)'
          }
        },
        required: ['tasklistId', 'taskId']
      }
    },
    {
      name: 'delete-task',
      description: 'Delete a task',
      inputSchema: {
        type: 'object',
        properties: {
          tasklistId: {
            type: 'string',
            description: 'The ID of the task list containing the task'
          },
          taskId: {
            type: 'string',
            description: 'The ID of the task to delete'
          }
        },
        required: ['tasklistId', 'taskId']
      }
    },
    {
      name: 'complete-task',
      description: 'Mark a task as completed',
      inputSchema: {
        type: 'object',
        properties: {
          tasklistId: {
            type: 'string',
            description: 'The ID of the task list containing the task'
          },
          taskId: {
            type: 'string',
            description: 'The ID of the task to complete'
          }
        },
        required: ['tasklistId', 'taskId']
      }
    },
    {
      name: 'move-task',
      description: 'Move a task (reorder or change parent)',
      inputSchema: {
        type: 'object',
        properties: {
          tasklistId: {
            type: 'string',
            description: 'The ID of the task list containing the task'
          },
          taskId: {
            type: 'string',
            description: 'The ID of the task to move'
          },
          parent: {
            type: 'string',
            description: 'New parent task identifier (optional, null to make top-level)'
          },
          previous: {
            type: 'string',
            description: 'Previous sibling task identifier for positioning (optional)'
          }
        },
        required: ['tasklistId', 'taskId']
      }
    }
  ];
}

export async function handleTaskTool(
  name: string,
  args: any,
  auth: GoogleTasksAuth
) {
  const tasks = await auth.getTasksClient();

  switch (name) {
    case 'list-tasks': {
      validateTaskListId(args.tasklistId);
      const response = await tasks.tasks.list({
        tasklist: args.tasklistId,
        showCompleted: args.showCompleted || false,
        showHidden: args.showHidden || false
      });
      console.log(response);
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    }

    case 'get-task': {
      validateTaskListId(args.tasklistId);
      validateTaskId(args.taskId);
      const response = await tasks.tasks.get({
        tasklist: args.tasklistId,
        task: args.taskId
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    }

    case 'create-task': {
      validateTaskListId(args.tasklistId);
      validateTitle(args.title);
      validateDateFormat(args.due);
      
      const requestBody: any = {
        title: args.title
      };
      
      if (args.notes) requestBody.notes = args.notes;
      if (args.due) requestBody.due = args.due;

      const response = await tasks.tasks.insert({
        tasklist: args.tasklistId,
        parent: args.parent,
        previous: args.previous,
        requestBody
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    }

    case 'update-task': {
      validateTaskListId(args.tasklistId);
      validateTaskId(args.taskId);
      validateDateFormat(args.due);
      validateStatus(args.status);
      
      const requestBody: any = {};
      
      if (args.title) requestBody.title = args.title;
      if (args.notes) requestBody.notes = args.notes;
      if (args.due) requestBody.due = args.due;
      if (args.status) requestBody.status = args.status;

      const response = await tasks.tasks.update({
        tasklist: args.tasklistId,
        task: args.taskId,
        requestBody
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    }

    case 'delete-task': {
      validateTaskListId(args.tasklistId);
      validateTaskId(args.taskId);
      await tasks.tasks.delete({
        tasklist: args.tasklistId,
        task: args.taskId
      });
      return {
        content: [{
          type: 'text' as const,
          text: `Task ${args.taskId} deleted successfully`
        }]
      };
    }

    case 'complete-task': {
      validateTaskListId(args.tasklistId);
      validateTaskId(args.taskId);
      const response = await tasks.tasks.update({
        tasklist: args.tasklistId,
        task: args.taskId,
        requestBody: {
          status: 'completed'
        }
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    }

    case 'move-task': {
      validateTaskListId(args.tasklistId);
      validateTaskId(args.taskId);
      const response = await tasks.tasks.move({
        tasklist: args.tasklistId,
        task: args.taskId,
        parent: args.parent,
        previous: args.previous
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}