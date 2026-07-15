import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let sequelize: Sequelize;

if (isProduction) {
  // Use PostgreSQL in production (Render)
  const dbHost = process.env.DB_HOST;
  const dbPort = parseInt(process.env.DB_PORT || '5432');
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'notes_app';

  if (!dbHost || !dbUser || !dbName) {
    logger.error('Missing database configuration environment variables on Render');
    process.exit(1);
  }

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      timestamps: true
    }
  });
} else {
  // Use MySQL in local development
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '3306');
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'notes_app';

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    define: {
      timestamps: true
    }
  });
}

export default sequelize;
