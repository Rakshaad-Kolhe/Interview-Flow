import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const verifyPayment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=payment.d.ts.map