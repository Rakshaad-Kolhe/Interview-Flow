/**
 * Demonstrates the difference between sequential and parallel execution using async/await.
 */
export const runAsyncAwaitDemo = async () => {
  const mockDbQuery = (id: number, delay: number) => 
    new Promise<string>((resolve) => setTimeout(() => resolve(`Result ${id}`), delay));

  // 1. Sequential Execution
  const startSequential = Date.now();
  const res1 = await mockDbQuery(1, 100);
  const res2 = await mockDbQuery(2, 100);
  const endSequential = Date.now();
  
  // 2. Parallel Execution
  const startParallel = Date.now();
  const [res3, res4] = await Promise.all([
    mockDbQuery(3, 100),
    mockDbQuery(4, 100)
  ]);
  const endParallel = Date.now();

  return {
    sequential: {
      results: [res1, res2],
      timeMs: endSequential - startSequential,
      explanation: 'Awaits each promise one after the other. Total time is approximately the sum of delays (100ms + 100ms = 200ms).'
    },
    parallel: {
      results: [res3, res4],
      timeMs: endParallel - startParallel,
      explanation: 'Awaits all promises concurrently using Promise.all. Total time is approximately the maximum delay (100ms).'
    }
  };
};
