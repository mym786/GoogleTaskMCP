
export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}

export class Logger {
    private logLevel: LogLevel;

    constructor(logLevel: LogLevel = LogLevel.INFO) {
        this.logLevel = logLevel;
        console.log(this.formatMessage('INFO', 'Logger initialized'));
    }

    private formatMessage(level: string, message: string, error?: Error): string {
        const timestamp = new Date().toISOString();
        let logEntry = `[${timestamp}] ${level}: ${message}`;
        
        if (error) {
            logEntry += `\nError: ${error.message}`;
            if (error.stack) {
                logEntry += `\nStack: ${error.stack}`;
            }
        }
        
        return logEntry;
    }

    private logToConsole(level: string, message: string, error?: Error): void {
        const logEntry = this.formatMessage(level, message, error);
        
        switch (level) {
            case 'ERROR':
                console.error(logEntry);
                break;
            case 'WARN':
                console.warn(logEntry);
                break;
            case 'INFO':
                console.info(logEntry);
                break;
            case 'DEBUG':
                console.debug(logEntry);
                break;
            default:
                console.log(logEntry);
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return level <= this.logLevel;
    }

    error(message: string, error?: Error): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            this.logToConsole('ERROR', message, error);
        }
    }

    warn(message: string, error?: Error): void {
        if (this.shouldLog(LogLevel.WARN)) {
            this.logToConsole('WARN', message, error);
        }
    }

    info(message: string): void {
        if (this.shouldLog(LogLevel.INFO)) {
            this.logToConsole('INFO', message);
        }
    }

    debug(message: string): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            this.logToConsole('DEBUG', message);
        }
    }

    logRequest(method: string, params?: any): void {
        this.info(`Request: ${method}${params ? ` with params: ${JSON.stringify(params)}` : ''}`);
    }

    logResponse(method: string, success: boolean, error?: Error): void {
        if (success) {
            this.info(`Response: ${method} completed successfully`);
        } else {
            this.error(`Response: ${method} failed`, error);
        }
    }

    logToolCall(toolName: string, args: any): void {
        this.info(`Tool called: ${toolName} with args: ${JSON.stringify(args)}`);
    }

    logToolResult(toolName: string, success: boolean, error?: Error): void {
        if (success) {
            this.info(`Tool result: ${toolName} completed successfully`);
        } else {
            this.error(`Tool result: ${toolName} failed`, error);
        }
    }
}

// Create a default logger instance
export const logger = new Logger(LogLevel.INFO);