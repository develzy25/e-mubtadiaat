import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { getAuth } from './lib/auth';
import { dashboardRoutes } from './routes/dashboard.routes';
import { attendanceRoutes } from './routes/attendance.routes';
import { adminRoutes } from './routes/admin.routes';

type Bindings = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', logger());
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return 'https://mubtadiaat.pages.dev';
    if (
      origin === 'http://localhost:5173' ||
      origin === 'https://mubtadiaat.pages.dev' ||
      origin.endsWith('.mubtadiaat.pages.dev')
    ) {
      return origin;
    }
    return 'https://mubtadiaat.pages.dev';
  },
  allowHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Basic Health Check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dashboard routes
app.route('/api/dashboard', dashboardRoutes);

// Attendance routes
app.route('/api/attendance', attendanceRoutes);

// Admin routes
app.route('/api/admin', adminRoutes);

// Better Auth API routes handler
app.all('/api/auth/*', (c) => {
  const auth = getAuth(
    {
      DB: c.env.DB,
      BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: c.env.BETTER_AUTH_URL,
    },
    c.req.url
  );
  return auth.handler(c.req.raw);
});

export default app;
