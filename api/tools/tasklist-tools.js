import { validateTaskListId, validateTitle } from '../utils/validation.js';
export function createTaskListTools(auth) {
    return [
        {
            name: 'list-tasklists',
            description: 'List all task lists in Google Tasks',
            inputSchema: {
                type: 'object',
                properties: {},
                required: []
            }
        },
        {
            name: 'get-tasklist',
            description: 'Get details about a specific task list',
            inputSchema: {
                type: 'object',
                properties: {
                    tasklistId: {
                        type: 'string',
                        description: 'The ID of the task list to retrieve'
                    }
                },
                required: ['tasklistId']
            }
        },
        {
            name: 'create-tasklist',
            description: 'Create a new task list',
            inputSchema: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'The title of the new task list'
                    }
                },
                required: ['title']
            }
        },
        {
            name: 'update-tasklist',
            description: 'Update an existing task list',
            inputSchema: {
                type: 'object',
                properties: {
                    tasklistId: {
                        type: 'string',
                        description: 'The ID of the task list to update'
                    },
                    title: {
                        type: 'string',
                        description: 'The new title for the task list'
                    }
                },
                required: ['tasklistId', 'title']
            }
        },
        {
            name: 'delete-tasklist',
            description: 'Delete a task list',
            inputSchema: {
                type: 'object',
                properties: {
                    tasklistId: {
                        type: 'string',
                        description: 'The ID of the task list to delete'
                    }
                },
                required: ['tasklistId']
            }
        }
    ];
}
export async function handleTaskListTool(name, args, auth) {
    const tasks = await auth.getTasksClient();
    switch (name) {
        case 'list-tasklists': {
            const response = await tasks.tasklists.list();
            console.log(response);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(response.data, null, 2)
                    }]
            };
        }
        case 'get-tasklist': {
            validateTaskListId(args.tasklistId);
            const response = await tasks.tasklists.get({
                tasklist: args.tasklistId
            });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(response.data, null, 2)
                    }]
            };
        }
        case 'create-tasklist': {
            validateTitle(args.title);
            const response = await tasks.tasklists.insert({
                requestBody: {
                    title: args.title
                }
            });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(response.data, null, 2)
                    }]
            };
        }
        case 'update-tasklist': {
            validateTaskListId(args.tasklistId);
            validateTitle(args.title);
            const response = await tasks.tasklists.update({
                tasklist: args.tasklistId,
                requestBody: {
                    title: args.title
                }
            });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(response.data, null, 2)
                    }]
            };
        }
        case 'delete-tasklist': {
            validateTaskListId(args.tasklistId);
            await tasks.tasklists.delete({
                tasklist: args.tasklistId
            });
            return {
                content: [{
                        type: 'text',
                        text: `Task list ${args.tasklistId} deleted successfully`
                    }]
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
