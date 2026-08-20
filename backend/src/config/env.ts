import dotenv from 'dotenv';
// Environment variables & secrets management
dotenv.config();

export const validateEnv = () => {
  const requiredVars = [
    'PORT',
    'DATABASE_URL',
    'MONGODB_URI',
    'REDIS_URL',
    'JWT_SECRET',
    'LLM_API_KEY'
  ];

  const missingVars = requiredVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    console.error(`[FATAL] Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
};
