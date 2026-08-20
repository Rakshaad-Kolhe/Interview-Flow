import { Request, Response } from 'express';
import { runEventLoopDemo } from '../utils/eventLoopDemo';
import { runAsyncAwaitDemo } from '../utils/asyncAwaitDemo';
import { runHoistingDemo } from '../utils/hoistingDemo';

export const getEventLoopDiagnostic = async (req: Request, res: Response) => {
  const result = await runEventLoopDemo();
  res.json({
    success: true,
    message: 'Event Loop execution order recorded.',
    data: { executionOrder: result }
  });
};

export const getAsyncAwaitDiagnostic = async (req: Request, res: Response) => {
  const result = await runAsyncAwaitDemo();
  res.json({
    success: true,
    message: 'Async/Await sequential vs parallel execution recorded.',
    data: result
  });
};

export const getHoistingDiagnostic = (req: Request, res: Response) => {
  const result = runHoistingDemo();
  res.json({
    success: true,
    message: 'Hoisting behaviors recorded.',
    data: result
  });
};

