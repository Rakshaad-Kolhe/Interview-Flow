import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodRawShape, ZodError } from 'zod';

export const validate = (schema: ZodObject<ZodRawShape>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (e: any) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: (e as any).errors,
        });
      }
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }
  };
};
