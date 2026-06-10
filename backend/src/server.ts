import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase } from './db/database';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import standRoutes from './routes/stands';
import productRoutes from './routes/products';
import transactionRoutes from './routes/transactions';
import exportRoutes from './routes/exports';
import { setupWebSocket } from './websocket/roomSocket';

const app = express();
const PORT = process.env.PORT || 3001;

initializeDatabase();

app.use(cors({ origin: '*', credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/stands', standRoutes);
app.use('/api', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api', exportRoutes);

const server = createServer(app);

setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`PopUp Analytics backend running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});

export default app;
