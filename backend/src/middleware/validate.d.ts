import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodRawShape } from 'zod';
export declare const validate: (schema: ZodObject<ZodRawShape>) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validate.d.ts.map