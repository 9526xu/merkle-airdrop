// backend/src/utils/logger.ts
const logger = {
  info: (message: string, context?: object) => {
    console.log(JSON.stringify({ level: 'info', message, ...context }));
  },
  error: (message: string, context?: object) => {
    console.error(JSON.stringify({ level: 'error', message, ...context }));
  },
};

export default logger;
