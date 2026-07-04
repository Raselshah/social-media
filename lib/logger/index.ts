type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  durationMs?: number;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatLog(level: LogLevel, message: string, context?: LogContext) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'socialmedia',
    environment: process.env.NODE_ENV || 'development',
    ...context,
  });
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (shouldLog('debug')) console.debug(formatLog('debug', message, context));
  },
  info(message: string, context?: LogContext) {
    if (shouldLog('info')) console.info(formatLog('info', message, context));
  },
  warn(message: string, context?: LogContext) {
    if (shouldLog('warn')) console.warn(formatLog('warn', message, context));
  },
  error(message: string, context?: LogContext) {
    if (shouldLog('error')) console.error(formatLog('error', message, context));
  },
  metric(name: string, value: number, context?: LogContext) {
    logger.info(`metric:${name}`, { metric: name, value, ...context });
  },
};

export function createRequestId(): string {
  return crypto.randomUUID();
}
