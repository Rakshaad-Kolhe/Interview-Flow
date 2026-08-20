import { Request, Response, NextFunction } from 'express';
import { logEventPromise } from '../utils/auditLogger';

/**
 * Demonstrates a Closure in JavaScript.
 * 
 * The `createRequestLogger` is a middleware factory. 
 * It takes a configuration parameter (`prefix`) and returns a middleware function.
 * 
 * The returned inner function retains access to its lexical scope (the `prefix` 
 * variable and the `requestCount` variable) even after the outer function has returned.
 */
export const createRequestLogger = (prefix: string) => {
  // Private encapsulated state. This counter is scoped to the specific closure 
  // created when this factory is called.
  let requestCount = 0;

  return (req: Request, res: Response, next: NextFunction) => {
    requestCount++;
    const message = `[${prefix}] Request #${requestCount} - ${req.method} ${req.url}`;
    
    // Non-blocking log using our Promise-based audit logger
    logEventPromise(message).catch(console.error);

    next();
  };
};
