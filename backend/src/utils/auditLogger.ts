import fs from 'fs';
import path from 'path';

const LOG_FILE_PATH = path.join(process.cwd(), 'audit.log');

/**
 * Demonstrates a Callback-based asynchronous operation.
 * Utilizes the traditional Node.js error-first callback pattern.
 */
export const logEventCallback = (eventData: string, callback: (err: NodeJS.ErrnoException | null) => void) => {
  const logEntry = `[${new Date().toISOString()}] ${eventData}\n`;
  fs.appendFile(LOG_FILE_PATH, logEntry, 'utf8', (err) => {
    if (err) {
      console.error('Failed to write audit log (Callback):', err);
      return callback(err);
    }
    callback(null);
  });
};

/**
 * Demonstrates a Promise-based asynchronous operation.
 * Utilizes modern fs.promises for cleaner control flow and error handling.
 */
export const logEventPromise = (eventData: string): Promise<void> => {
  const logEntry = `[${new Date().toISOString()}] ${eventData}\n`;
  return fs.promises.appendFile(LOG_FILE_PATH, logEntry, 'utf8')
    .catch((err) => {
      console.error('Failed to write audit log (Promise):', err);
      throw err;
    });
};
