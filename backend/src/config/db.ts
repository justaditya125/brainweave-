import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'CHANGE_ME_TO_A_RANDOM_64_CHAR_SECRET') {
  logger.error('JWT_SECRET must be changed from the default value in production');
  process.exit(1);
}

const dbHost = process.env.DB_HOST!;
const dbPort = parseInt(process.env.DB_PORT || '3306');
const dbUser = process.env.DB_USER!;
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME!;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: process.env.NODE_ENV !== 'production' ? (msg) => logger.debug(msg) : false,
  define: {
    timestamps: true
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    idle: parseInt(process.env.DB_POOL_IDLE || '30000'),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '60000'),
  },
});

export default sequelize;
