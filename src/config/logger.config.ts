import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'bitrix24-gsheet-integration' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          // Chỉ hiển thị log quan trọng
          if (level === 'error' || level === 'warn' || level === 'info') {
            return `${timestamp} [${context || 'App'}] ${level}: ${message}`;
          }
          return ''; // Return empty string instead of null
        }),
      ),
    }),
    new winston.transports.File({
      filename: process.env.LOG_FILE || 'logs/app.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
  // Loại bỏ các log không quan trọng
  silent: process.env.NODE_ENV === 'test',
});

