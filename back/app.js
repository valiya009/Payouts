import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbcoonecton } from './db.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRouter   from './Router/authRouter.js';
import vendorRouter from './Router/vendorRouter.js';
import payoutRouter from './Router/payoutRouter.js';

dotenv.config({ path: './.env' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({
  origin: [
    'https://payouts-uwfw.vercel.app',
    'http://localhost:5173',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(logger);

// API routes
app.use('/api/v1/auth',    authRouter);
app.use('/api/v1/vendors', vendorRouter);
app.use('/api/v1/payouts', payoutRouter);

// Serve React frontend
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
dbcoonecton();
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
