import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import chalk from 'chalk';
import path from 'path';

import usersRouter from './controllers/users.js';
import cardsRouter from './controllers/cards.js';
import { consoleLogger, fileErrorLogger, fileErrorLoggerMiddleware } from './middlewares/logger.js';
import { seedInitialData } from './services/seed.service.js';

dotenv.config();

// Connect to MongoDB (local or Atlas via MONGO_URL)
const mongoUri = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/business_cards_db';
try {
    await mongoose.connect(mongoUri);
    console.log(chalk.green.bold('Connected successfully to MongoDB:'), chalk.cyan(mongoUri));
    await seedInitialData();
} catch (err) {
    console.error(chalk.red.bold('MongoDB connection failed:'), err.message);
}

const app = express();

// Loggers
app.use(consoleLogger);
app.use(fileErrorLoggerMiddleware);

// CORS configuration (restricts or allows allowed origins)
const allowedOrigins = process.env.FRONTEND_URL && process.env.FRONTEND_URL !== '*'
    ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
    : '*';

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, x-auth-token'
}));

// Body parser
app.use(express.json());

// Main routers
app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

// Root test route
app.get('/', (req, res) => {
    res.send({ message: 'Welcome to Business Cards API!' });
});

// Static public folder fallback (req 7)
const publicPath = path.resolve('public');
app.use(express.static(publicPath));

// 404 Handler for undefined routes and missing static files
app.use((req, res) => {
    res.status(404).send({ message: `Page Not Found: Cannot ${req.method} ${req.originalUrl}` });
});

// File error logger and centralized error handling (Bonus 2 & req 9)
app.use(fileErrorLogger);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(chalk.yellow.bold(`Server is running on port ${PORT}`));
});

export default app;
