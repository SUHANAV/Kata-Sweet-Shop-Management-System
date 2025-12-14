import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const DATABASE_PATH = process.env.DATABASE_PATH || path.resolve(__dirname, '..', '..', 'data', 'sweetshop.db');
export const JWT_SECRET = process.env.JWT_SECRET ?? 'change_me';
export const PORT = Number(process.env.PORT ?? 4000);
