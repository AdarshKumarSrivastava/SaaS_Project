import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes';
import sitesRoutes from './sites/sites.routes';
import { prisma } from './lib/prisma';
import { sanitizeInput } from './middleware/sanitizeInput';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(sanitizeInput);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sites', sitesRoutes);

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/buildspace';
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Check Prisma connection
    await prisma.$queryRaw`SELECT 1`;
    // Check Mongoose connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({
      status: 'ok',
      postgres: 'connected',
      mongodb: mongoStatus
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

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
