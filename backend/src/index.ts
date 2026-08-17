import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes';
import sitesRoutes from './sites/sites.routes';
import publicRoutes from './public/public.routes';
import hireRoutes from './hire/hire.routes';
import aiRoutes from './ai/ai.routes';
import enquiryRoutes from './enquiry/enquiry.routes';
import { prisma } from './lib/prisma';
import { sanitizeInput } from './middleware/sanitizeInput';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_PLATFORM_SECRET',
  'PLATFORM_AI_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`[FATAL] Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(cookieParser());
app.use(sanitizeInput);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/hire', hireRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/enquiry', enquiryRoutes);

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Check Prisma connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ok',
      postgres: 'connected'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: String(error)
    });
  }
});

// Global Error Handler must be the last middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
