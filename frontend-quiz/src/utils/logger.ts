type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

const envLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';
const currentLevel = levelOrder[envLevel] ?? levelOrder.info;

const redactKeys = ['password', 'token', 'authorization', 'cookie', 'set-cookie'];

const sanitize = (payload: unknown): unknown => {
    if (payload === null || payload === undefined) return payload;
    try {
        return JSON.parse(JSON.stringify(payload, (key, value) => {
            const lower = key.toLowerCase();
            if (redactKeys.some((k) => lower.includes(k))) {
                return '[REDACTED]';
            }
            return value;
        }));
    } catch {
        return payload;
    }
};

const shouldLog = (level: LogLevel): boolean => levelOrder[level] >= currentLevel;

export const logger = {
    debug: (message: string, meta?: unknown) => shouldLog('debug') && console.debug(message, sanitize(meta)),
    info: (message: string, meta?: unknown) => shouldLog('info') && console.info(message, sanitize(meta)),
    warn: (message: string, meta?: unknown) => shouldLog('warn') && console.warn(message, sanitize(meta)),
    error: (message: string, meta?: unknown) => shouldLog('error') && console.error(message, sanitize(meta)),
};
