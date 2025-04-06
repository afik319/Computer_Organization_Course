import winston from 'winston';

const formatMessage = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  let output = '';

  // Convert Buffer to string if needed
  if (Buffer.isBuffer(message)) {
    output += message.toString('utf8');
  } else if (typeof message === 'object') {
    output += JSON.stringify(message, null, 2);
  } else {
    output += message;
  }

  // stringify meta args (if present)
  const metaValues = Object.values(meta);
  if (metaValues.length > 0) {
    output += ' ' + metaValues.map(m => {
      if (Buffer.isBuffer(m)) {
        return m.toString('utf8');
      }
      return typeof m === 'object'
        ? JSON.stringify(m, null, 2)
        : String(m);
    }).join(' ');
  }

  return `${timestamp} [${level.toUpperCase()}]: ${output}`;
});

const transports = [
  new winston.transports.File({ filename: 'logs/errors.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

if (process.env.NODE_ENV === 'development') {
  transports.push(new winston.transports.Console());
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    formatMessage
  ),
  transports,
});

export { logger };
