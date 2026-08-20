import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkPostgresConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'connected';
  } catch (error) {
    return 'disconnected';
  }
};

export default prisma;
