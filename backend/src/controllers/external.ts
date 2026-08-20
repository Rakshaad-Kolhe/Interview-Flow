import { Request, Response } from 'express';
import { getProgrammingChallenge } from '../services/external';

export const fetchChallenge = async (req: Request, res: Response) => {
  try {
    const challenge = await getProgrammingChallenge();
    res.json({
      success: true,
      data: challenge,
    });
  } catch (error: any) {
    res.status(503).json({ 
      success: false, 
      message: error.message || 'Unable to fetch external challenge' 
    });
  }
};
