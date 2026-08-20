export declare const verifyAndUnlockPremium: (userId: string, amount: number, mockProviderStatus: string) => Promise<{
    id: string;
    userId: string;
    amount: number;
    status: string;
    provider: string;
    transactionId: string | null;
    createdAt: Date;
}>;
//# sourceMappingURL=payment.d.ts.map