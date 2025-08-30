import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GoogleTasksAuth } from '../auth.js';
export declare function createTaskListTools(auth: GoogleTasksAuth): Tool[];
export declare function handleTaskListTool(name: string, args: any, auth: GoogleTasksAuth): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
