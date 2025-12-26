import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateEnvironment } from './config/env.js';

dotenv.config();
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

if (process.env.NODE_ENV !== 'test') {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });

  const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many signup attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/auth/login', authLimiter);
  app.use('/auth/signup', signupLimiter);
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/auth', authRoutes);
app.use('/', webhookRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/', contactRoutes);
app.use('/', messageRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
