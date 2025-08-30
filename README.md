# Google Tasks MCP Server

A Model Context Protocol (MCP) server that provides integration with Google Tasks API, enabling task and task list management through Claude and other MCP-compatible applications.

## Features

### Task List Management
- `list-tasklists` - List all your task lists
- `get-tasklist` - Get details about a specific task list
- `create-tasklist` - Create a new task list
- `update-tasklist` - Update an existing task list
- `delete-tasklist` - Delete a task list

### Task Management
- `list-tasks` - List all tasks in a task list
- `get-task` - Get details about a specific task
- `create-task` - Create a new task
- `update-task` - Update an existing task
- `delete-task` - Delete a task
- `complete-task` - Mark a task as completed
- `move-task` - Move a task (reorder or change parent)
- `clear-completed-tasks` - Clear all completed tasks from a list

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Google API Setup

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Tasks API:
   - Go to "APIs & Services" > "Library"
   - Search for "Tasks API"
   - Click "Enable"

### 2. Create Service Account Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details
4. Click "Create and Continue"
5. Skip granting roles (click "Continue")
6. Skip granting user access (click "Done")
7. Click on the created service account
8. Go to the "Keys" tab
9. Click "Add Key" > "Create New Key"
10. Select "JSON" and click "Create"
11. Save the downloaded JSON file securely

### 3. Enable Domain-Wide Delegation (Optional)

If you want to access tasks for multiple users in a Google Workspace domain:

1. In the service account details, check "Enable Google Workspace Domain-wide Delegation"
2. Note the "Client ID" 
3. In your Google Workspace Admin Console:
   - Go to Security > API Controls > Domain-wide Delegation
   - Add the Client ID with scope: `https://www.googleapis.com/auth/tasks`

## Configuration

You can provide Google credentials in several ways:

### Option 1: Environment File (.env)
Create a `.env` file in the project root:
```bash
# Copy .env.example to .env and configure
cp .env.example .env
```

Example `.env` file:
```bash
# Option A: Path to credentials file
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# Option B: Inline JSON credentials
GOOGLE_CREDENTIALS_JSON='{"type":"service_account","project_id":"your-project",...}'
```

The server will automatically load environment variables from:
- `.env`
- `.env.local` 
- `config.env`

### Option 2: Environment Variables
```bash
export GOOGLE_CREDENTIALS_JSON='{"type":"service_account","project_id":"your-project",...}'
# OR
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/credentials.json"
```

### Option 3: Direct File Placement
Place your credentials file in the project root as:
- `credentials.json`
- `google-credentials.json`

## Usage with Claude Desktop

Add the following to your Claude Desktop configuration file:

### macOS
`~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows
`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "google-tasks": {
      "command": "node",
      "args": ["/path/to/google-tasks-mcp-server/dist/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/your/credentials.json"
      }
    }
  }
}
```

Or with inline credentials:

```json
{
  "mcpServers": {
    "google-tasks": {
      "command": "node",
      "args": ["/path/to/google-tasks-mcp-server/dist/index.js"],
      "env": {
        "GOOGLE_CREDENTIALS_JSON": "{\"type\":\"service_account\",\"project_id\":\"your-project\",...}"
      }
    }
  }
}
```

## Available Tools

### Task List Management

#### `list-tasklists`
List all task lists.

**Parameters:** None

**Example:**
```
Use the list-tasklists tool to see all my task lists
```

#### `get-tasklist`
Get details about a specific task list.

**Parameters:**
- `tasklistId` (string, required): The ID of the task list

**Example:**
```
Use get-tasklist with tasklistId "MTU2NjkzMDQwMDQ1MDI4MTY2NDQ6MDow"
```

#### `create-tasklist`
Create a new task list.

**Parameters:**
- `title` (string, required): The title of the new task list

**Example:**
```
Use create-tasklist to create a new task list called "Shopping List"
```

#### `update-tasklist`
Update an existing task list.

**Parameters:**
- `tasklistId` (string, required): The ID of the task list to update
- `title` (string, required): The new title for the task list

#### `delete-tasklist`
Delete a task list.

**Parameters:**
- `tasklistId` (string, required): The ID of the task list to delete

### Task Management

#### `list-tasks`
List tasks in a task list.

**Parameters:**
- `tasklistId` (string, required): The ID of the task list
- `showCompleted` (boolean, optional): Whether to include completed tasks (default: false)
- `showHidden` (boolean, optional): Whether to include hidden tasks (default: false)

#### `get-task`
Get details about a specific task.

**Parameters:**
- `tasklistId` (string, required): The ID of the task list containing the task
- `taskId` (string, required): The ID of the task

#### `create-task`
Create a new task.

**Parameters:**
- `tasklistId` (string, required): The ID of the task list to add the task to
- `title` (string, required): The title of the new task
- `notes` (string, optional): Notes for the task
- `due` (string, optional): Due date in RFC 3339 format
- `parent` (string, optional): Parent task ID for creating subtasks
- `previous` (string, optional): Previous sibling task ID for positioning

**Example:**
```
Use create-task to add "Buy groceries" to my shopping list with due date "2024-12-25T10:00:00.000Z"
```

#### `update-task`
Update an existing task.

**Parameters:**
- `tasklistId` (string, required): The ID of the task list containing the task
- `taskId` (string, required): The ID of the task to update
- `title` (string, optional): New title for the task
- `notes` (string, optional): New notes for the task
- `due` (string, optional): New due date in RFC 3339 format
- `status` (string, optional): Task status ("needsAction" or "completed")

#### `delete-task`
Delete a task.

**Parameters:**
- `tasklistId` (string, required): The ID of the task list containing the task
- `taskId` (string, required): The ID of the task to delete

#### `complete-task`
Mark a task as completed.

**Parameters:**
- `tasklistId` (string, required): The ID of the task list containing the task
- `taskId` (string, required): The ID of the task to complete

#### `move-task`
Move a task to change its position or parent.

**Parameters:**
- `tasklistId` (string, required): The ID of the task list containing the task
- `taskId` (string, required): The ID of the task to move
- `parent` (string, optional): New parent task ID (null to make top-level)
- `previous` (string, optional): Previous sibling task ID for positioning

#### `clear-completed-tasks`
Clear all completed tasks from a task list.

**Parameters:**
- `tasklistId` (string, required): The ID of the task list to clear completed tasks from

## Development

### Scripts
- `npm run build` - Build the TypeScript code
- `npm run dev` - Build in watch mode
- `npm start` - Start the server

### Project Structure
```
src/
├── index.ts                    # Main server entry point
├── auth.ts                     # Google authentication setup
├── tools/
│   ├── tasklist-tools.ts       # Task list management tools
│   ├── task-tools.ts           # Task management tools
│   └── clear-completed-tools.ts # Clear completed tasks tool
└── utils/
    └── validation.ts           # Input validation utilities
```

## Troubleshooting

### Authentication Issues
- Ensure your service account JSON is valid
- Check that the Tasks API is enabled in Google Cloud Console
- Verify the credentials have proper access to the Google account

### Permission Issues
- Make sure the service account has been shared with the Google account if using personal Google Tasks
- For Google Workspace, ensure domain-wide delegation is properly configured

### Connection Issues
- Check that the MCP server path is correct in your Claude configuration
- Verify the environment variables are properly set
- Look at the Claude Desktop logs for error messages

## License

MIT License - see LICENSE file for details.