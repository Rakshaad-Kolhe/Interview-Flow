/**
 * Demonstrates the Node.js Event Loop execution order.
 * 
 * Expected Execution Order:
 * 1. Synchronous code (Call Stack)
 * 2. Microtasks (Promise.then, queueMicrotask)
 * 3. Macrotasks (setTimeout, setImmediate)
 */
export const runEventLoopDemo = (): Promise<string[]> => {
  return new Promise((resolve) => {
    const executionOrder: string[] = [];

    // 1. Synchronous (Executes immediately on the call stack)
    executionOrder.push('1. Synchronous Task Start');

    // 2. Macrotask (Executes in the timers phase of the event loop)
    setTimeout(() => {
      executionOrder.push('4. Macrotask (setTimeout)');
      resolve(executionOrder); // Resolve the promise after all tasks complete
    }, 0);

    // 3. Microtask (Executes immediately after current synchronous code completes, before macrotasks)
    Promise.resolve().then(() => {
      executionOrder.push('3. Microtask (Promise.resolve)');
    });

    // 4. Synchronous (Executes immediately)
    executionOrder.push('2. Synchronous Task End');
  });
};
