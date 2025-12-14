import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/auth';
import sweetsRoutes from './routes/sweets';
import uploadRoutes from './routes/uploads';

const app = express();
const uploadsDir = path.resolve(process.cwd(), 'uploads');

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

export default app;
