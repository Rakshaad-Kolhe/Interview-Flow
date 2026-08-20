"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchChallenge = void 0;
const external_1 = require("../services/external");
const fetchChallenge = async (req, res) => {
    try {
        const challenge = await (0, external_1.getProgrammingChallenge)();
        res.json({
            success: true,
            data: challenge,
        });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            message: error.message || 'Unable to fetch external challenge'
        });
    }
};
exports.fetchChallenge = fetchChallenge;
//# sourceMappingURL=external.js.map