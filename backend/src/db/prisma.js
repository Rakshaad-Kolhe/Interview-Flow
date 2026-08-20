"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPostgresConnection = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const checkPostgresConnection = async () => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        return 'connected';
    }
    catch (error) {
        return 'disconnected';
    }
};
exports.checkPostgresConnection = checkPostgresConnection;
exports.default = prisma;
//# sourceMappingURL=prisma.js.map