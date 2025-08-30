export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
export declare class Logger {
    private logLevel;
    constructor(logLevel?: LogLevel);
    private formatMessage;
    private logToConsole;
    private shouldLog;
    error(message: string, error?: Error): void;
    warn(message: string, error?: Error): void;
    info(message: string): void;
    debug(message: string): void;
    logRequest(method: string, params?: any): void;
    logResponse(method: string, success: boolean, error?: Error): void;
    logToolCall(toolName: string, args: any): void;
    logToolResult(toolName: string, success: boolean, error?: Error): void;
}
export declare const logger: Logger;
