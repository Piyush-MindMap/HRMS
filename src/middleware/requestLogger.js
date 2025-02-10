import morgan from 'morgan';
import { createLogger, format as _format, transports as _transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = createLogger({
  level: 'info',
  format: _format.combine(
    _format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    _format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
  ),
  transports: [
    new _transports.Console(),

    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // Retain logs for 14 days
      level: 'info',
    }),

    new DailyRotateFile({
      filename: 'logs/warn-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '14d', // Retain logs for 14 days
      level: 'warn',
    }),
  ],
});

export const loggerMiddleware = morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

export default logger;
