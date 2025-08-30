import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GoogleTasksAuth } from '../auth.js';
export declare function createClearCompletedTools(auth: GoogleTasksAuth): Tool[];
export declare function handleClearCompletedTool(name: string, args: any, auth: GoogleTasksAuth): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
