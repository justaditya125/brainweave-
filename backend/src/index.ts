import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import dotenv from 'dotenv';
import sequelize from './config/db';
import logger from './utils/logger';
import { setupCollaboration } from './collaboration/server';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import tagRoutes from './routes/tagRoutes';
import noteRoutes from './routes/noteRoutes';
import statsRoutes from './routes/statsRoutes';
import versionRoutes from './routes/versionRoutes';
import shareRoutes from './routes/shareRoutes';
import twoFactorRoutes from './routes/twoFactorRoutes';
import noteLinkRoutes from './routes/noteLinkRoutes';
import boardRoutes from './routes/boardRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/2fa/request-code', authLimiter);
app.use('/api/2fa/verify-login', authLimiter);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/health') {
      logger.info({ method: req.method, path: req.path, status: res.statusCode, duration: `${duration}ms` });
    }
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/links', noteLinkRoutes);
app.use('/api/board', boardRoutes);

// Health check with DB verification
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'ok', database: 'connected', timestamp: new Date() });
  } catch (error) {
    logger.error('Health check failed: database unreachable');
    res.status(503).json({ status: 'error', database: 'disconnected', timestamp: new Date() });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err, method: req.method, path: req.path }, 'Unhandled error');
  res.status(500).json({ message: 'Internal server error' });
});

// Server reference for graceful shutdown
let server: ReturnType<typeof httpServer.listen>;
let io: ReturnType<typeof setupCollaboration>;

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('MySQL connection established');

    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('Database tables synced (dev mode)');
    } else {
      logger.info('Production mode: Skipping auto-sync. Run migrations instead.');
    }

    // Setup WebSocket collaboration
    io = setupCollaboration(httpServer);
    logger.info('WebSocket collaboration server initialized');

    server = httpServer.listen(PORT, () => {
      logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, 'Server started');
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown');

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  // Close WebSocket connections
  if (io) {
    io.close();
    logger.info('WebSocket server closed');
  }

  // Close database connection
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error({ err: error }, 'Error closing database connection');
  }

  logger.info('Graceful shutdown complete');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections and exceptions
process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (error: Error) => {
  logger.error({ err: error }, 'Uncaught exception');
  gracefulShutdown('uncaughtException');
});

startServer();
