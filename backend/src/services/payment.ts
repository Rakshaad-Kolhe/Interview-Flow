import prisma from '../db/prisma';

export const verifyAndUnlockPremium = async (userId: string, amount: number, mockProviderStatus: string) => {
  // Simulate checking with a real payment provider
  if (mockProviderStatus !== 'succeeded') {
    throw new Error('Payment verification failed at provider');
  }

  // Use a Prisma transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // 1. Record the verified payment
    const payment = await tx.payment.create({
      data: {
        userId,
        amount,
        status: 'succeeded',
        provider: 'mock-sandbox',
        transactionId: `txn_${Math.random().toString(36).substring(7)}`,
      },
    });

    // 2. Unlock premium functionality by updating the user's latest interview or creating a flag
    // For demonstration, we'll just log an action to show atomicity, or we could update all user's interviews to "premium"
    await tx.interviewLog.create({
      data: {
        interviewId: 'system-wide', // Conceptually applied system wide
        action: 'UNLOCKED_PREMIUM',
      },
    });

    return payment;
  });

  return result;
};
