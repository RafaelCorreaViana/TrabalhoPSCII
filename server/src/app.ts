import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import matchRoutes from './routes/match.routes';
import teamRoutes from './routes/team.routes';
import registrationRoutes from './routes/registration.routes';
import playerRoutes from './routes/player.routes';
import notificationRoutes from './routes/notification.routes';
import venueRoutes from './routes/venue.routes';
import bookingRoutes from './routes/booking.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io config
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// PostgreSQL pool for session store
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const PgSessionStore = pgSession(session);

app.use(
  session({
    store: new PgSessionStore({
      pool: pgPool,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET || 'super_secret_dev_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/events/:eventId/matches', matchRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/events/:eventId/registrations', registrationRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);

// Socket.io: autenticar por sessão e ingressar em sala pessoal
io.on('connection', (socket) => {
  const userId = (socket.request as any).session?.userId;

  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`Socket connected: user ${userId} -> room user:${userId}`);
  } else {
    console.log('Anonymous socket connected:', socket.id);
  }

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
