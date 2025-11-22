import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.writeLog(LogLevel.INFO, message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.writeLog(LogLevel.ERROR, message, context, { trace });
  }

  warn(message: string, context?: string) {
    this.writeLog(LogLevel.WARN, message, context);
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog(LogLevel.DEBUG, message, context);
    }
  }

  verbose(message: string, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog(LogLevel.DEBUG, message, context);
    }
  }

  private writeLog(
    level: LogLevel,
    message: string,
    context?: string,
    meta?: Record<string, any>
  ) {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';

    const logEntry = {
      timestamp,
      level,
      context: ctx,
      message,
      ...meta,
    };

    // In production, send to logging service (e.g., CloudWatch, Datadog)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with logging service
      console.log(JSON.stringify(logEntry));
    } else {
      // Development: Pretty print
      const color = this.getColor(level);
      console.log(
        `${color}[${timestamp}] [${level.toUpperCase()}] [${ctx}]${this.resetColor} ${message}`
      );
      if (meta && Object.keys(meta).length > 0) {
        console.log(JSON.stringify(meta, null, 2));
      }
    }
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red
      case LogLevel.WARN:
        return '\x1b[33m'; // Yellow
      case LogLevel.INFO:
        return '\x1b[36m'; // Cyan
      case LogLevel.DEBUG:
        return '\x1b[35m'; // Magenta
      default:
        return '';
    }
  }

  private get resetColor(): string {
    return '\x1b[0m';
  }
}
