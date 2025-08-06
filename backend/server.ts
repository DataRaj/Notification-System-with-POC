// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// Import services and routes
import { NotificationService } from './services/notification-bull';
import { EventService } from './services/event.service.js';
import { initializeQueues } from './queues/index.js';
import userRoutes from './routes/user.js';
import postRoutes from './routes/posts.js';
import notificationRoutes from './routes/notification.js';

dotenv.config();

const app = express();
const server = createServer(app);
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// CORS configuration
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://insyd-assesment.vercel.app'] 
  : ['http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST", "DELETE", "PATCH"]
  }
});

// Middleware
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Initialize services
const notificationService = new NotificationService(prisma, io, redis);
const eventService = new EventService(notificationService);

// Store active socket connections
const activeConnections = new Map();

// Async initialization
(async () => {
  // Initialize queues and workers
  await initializeQueues(redis, notificationService);
})();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    activeConnections.set(userId, socket.id);
    socket.join(userId);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of activeConnections.entries()) {
      if (socketId === socket.id) {
        activeConnections.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Attach services to app for route access
app.locals.services = {
  notification: notificationService,
  event: eventService,
  prisma,
  activeConnections
};

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('BullMQ queues initialized');
});