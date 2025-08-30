export function validateTaskListId(tasklistId: string): void {
  if (!tasklistId || typeof tasklistId !== 'string' || tasklistId.trim().length === 0) {
    throw new Error('Task list ID is required and must be a non-empty string');
  }
}

export function validateTaskId(taskId: string): void {
  if (!taskId || typeof taskId !== 'string' || taskId.trim().length === 0) {
    throw new Error('Task ID is required and must be a non-empty string');
  }
}

export function validateTitle(title: string): void {
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Title is required and must be a non-empty string');
  }
}

export function validateDateFormat(date: string): void {
  if (!date) return;
  
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }
  } catch (error) {
    throw new Error('Due date must be in valid RFC 3339 format (e.g., "2024-12-25T10:00:00.000Z")');
  }
}

export function validateStatus(status: string): void {
  if (!status) return;
  
  const validStatuses = ['needsAction', 'completed'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }
}