export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (LogLevel = {}));
export class Logger {
    logLevel;
    constructor(logLevel = LogLevel.INFO) {
        this.logLevel = logLevel;
        console.log(this.formatMessage('INFO', 'Logger initialized'));
    }
    formatMessage(level, message, error) {
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
    logToConsole(level, message, error) {
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
    shouldLog(level) {
        return level <= this.logLevel;
    }
    error(message, error) {
        if (this.shouldLog(LogLevel.ERROR)) {
            this.logToConsole('ERROR', message, error);
        }
    }
    warn(message, error) {
        if (this.shouldLog(LogLevel.WARN)) {
            this.logToConsole('WARN', message, error);
        }
    }
    info(message) {
        if (this.shouldLog(LogLevel.INFO)) {
            this.logToConsole('INFO', message);
        }
    }
    debug(message) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            this.logToConsole('DEBUG', message);
        }
    }
    logRequest(method, params) {
        this.info(`Request: ${method}${params ? ` with params: ${JSON.stringify(params)}` : ''}`);
    }
    logResponse(method, success, error) {
        if (success) {
            this.info(`Response: ${method} completed successfully`);
        }
        else {
            this.error(`Response: ${method} failed`, error);
        }
    }
    logToolCall(toolName, args) {
        this.info(`Tool called: ${toolName} with args: ${JSON.stringify(args)}`);
    }
    logToolResult(toolName, success, error) {
        if (success) {
            this.info(`Tool result: ${toolName} completed successfully`);
        }
        else {
            this.error(`Tool result: ${toolName} failed`, error);
        }
    }
}
// Create a default logger instance
export const logger = new Logger(LogLevel.INFO);
