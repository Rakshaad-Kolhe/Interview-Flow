"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("../db/prisma"));
const initCronJobs = () => {
    // Run every hour at minute 0
    node_cron_1.default.schedule('0 * * * *', async () => {
        console.log('[Cron] Running cleanup job for abandoned interviews...');
        try {
            // Logic: Mark interviews stuck in "created" state for more than 24 hours as "abandoned"
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const result = await prisma_1.default.interview.updateMany({
                where: {
                    status: 'created',
                    createdAt: {
                        lt: yesterday,
                    },
                },
                data: {
                    status: 'abandoned',
                },
            });
            console.log(`[Cron] Cleanup complete. Marked ${result.count} interviews as abandoned.`);
        }
        catch (error) {
            console.error('[Cron] Cleanup job failed:', error);
        }
    });
    console.log('[Cron] Scheduled jobs initialized.');
};
exports.initCronJobs = initCronJobs;
//# sourceMappingURL=cleanup.js.map