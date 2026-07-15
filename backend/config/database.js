import { Options } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const config: Options = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'notes_app',
  dialect: 'mysql',
  logging: false,
};

module.exports = {
  development: config,
  production: config,
  test: config,
};
