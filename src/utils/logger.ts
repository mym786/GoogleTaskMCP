import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}

export class Logger {
    private logLevel: LogLevel;
    private logFile: string;
    private logDir: string;

    constructor(logLevel: LogLevel = LogLevel.INFO, logFile: string = 'app.log') {
        this.logLevel = logLevel;
        this.logDir = join(process.cwd(), 'logs');
        this.logFile = join(this.logDir, logFile);
        
        // Create logs directory if it doesn't exist
        if (!existsSync(this.logDir)) {
            mkdirSync(this.logDir, { recursive: true });
        }
        
        // Initialize log file with startup message
        this.writeToFile('INFO', 'Logger initialized');
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
        
        return logEntry + '\n';
    }

    private writeToFile(level: string, message: string, error?: Error): void {
        try {
            const logEntry = this.formatMessage(level, message, error);
            appendFileSync(this.logFile, logEntry);
        } catch (err) {
            // Fallback to console if file writing fails
            console.error('Failed to write to log file:', err);
            console.error('Original log:', level, message, error);
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return level <= this.logLevel;
    }

    error(message: string, error?: Error): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            this.writeToFile('ERROR', message, error);
            // Don't log to console in MCP mode - it interferes with JSON protocol
        }
    }

    warn(message: string, error?: Error): void {
        if (this.shouldLog(LogLevel.WARN)) {
            this.writeToFile('WARN', message, error);
            // Don't log to console in MCP mode - it interferes with JSON protocol
        }
    }

    info(message: string): void {
        if (this.shouldLog(LogLevel.INFO)) {
            this.writeToFile('INFO', message);
            // Don't log to console in MCP mode - it interferes with JSON protocol
        }
    }

    debug(message: string): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            this.writeToFile('DEBUG', message);
            // Don't log to console in MCP mode - it interferes with JSON protocol
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