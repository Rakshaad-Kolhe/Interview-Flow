import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { verifyAndUnlockPremium } from '../services/payment';

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // In a real app, this would be a webhook payload or a session ID that the backend 
    // verifies entirely server-side with the provider (e.g. Stripe API).
    const { amount, simulatedStatus } = req.body;

    if (!amount || !simulatedStatus) {
      return res.status(400).json({ success: false, message: 'Invalid payment data' });
    }

    const payment = await verifyAndUnlockPremium(userId, amount, simulatedStatus);

    res.json({
      success: true,
      message: 'Premium unlocked successfully',
      data: payment,
    });
  } catch (error: any) {
    console.error('Payment Error:', error.message);
    res.status(400).json({ success: false, message: 'Payment verification failed' });
  }
};
