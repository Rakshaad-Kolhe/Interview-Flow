"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = void 0;
const payment_1 = require("../services/payment");
const verifyPayment = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        // In a real app, this would be a webhook payload or a session ID that the backend 
        // verifies entirely server-side with the provider (e.g. Stripe API).
        const { amount, simulatedStatus } = req.body;
        if (!amount || !simulatedStatus) {
            return res.status(400).json({ success: false, message: 'Invalid payment data' });
        }
        const payment = await (0, payment_1.verifyAndUnlockPremium)(userId, amount, simulatedStatus);
        res.json({
            success: true,
            message: 'Premium unlocked successfully',
            data: payment,
        });
    }
    catch (error) {
        console.error('Payment Error:', error.message);
        res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
};
exports.verifyPayment = verifyPayment;
//# sourceMappingURL=payment.js.map