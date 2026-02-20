// ─────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const compression = require('compression');
const helmet = require('helmet');

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────
// BASIC MIDDLEWARE
// ─────────────────────────────────────────────
app.use(cors({
    origin: true,          // Reflect request origin automatically
    credentials: true
}));
app.use(compression());
app.use(helmet());

app.use(express.json());

// Optional request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Wrap route loading in try/catch so server never crashes
try {
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/products', require('./routes/products'));
    app.use('/api/orders', require('./routes/orders'));
    app.use('/api/marketing', require('./routes/marketing'));
    app.use('/api/settings', require('./routes/settings'));
} catch (err) {
    console.error('❌ Route loading failed:', err.message);
}

// Test DB route
app.get('/api/test-db', async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        res.json({
            status: 'success',
            userCount
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});

// ─────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// ─────────────────────────────────────────────
// START SERVER (Railway Safe)
// ─────────────────────────────────────────────
const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Database connected');
    } catch (error) {
        console.error('⚠️ Database connection failed (server will still start)');
        console.error(error.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔌 DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'MISSING'}`);
    });
};

startServer();
