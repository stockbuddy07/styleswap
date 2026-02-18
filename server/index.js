const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

/* ───────────────────────────────────────────────
   CORS CONFIGURATION
─────────────────────────────────────────────── */

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5175',
    'https://styleswap-tau.vercel.app',
    'https://styleswap-production.up.railway.app'
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser tools like Postman
        if (!origin) return callback(null, true);

        // Allow exact matches
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow ANY vercel preview deployment
        if (/\.vercel\.app$/.test(origin)) {
            return callback(null, true);
        }

        console.warn(`⚠️ CORS blocked: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

// Apply CORS BEFORE routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* ───────────────────────────────────────────────
   MIDDLEWARE
─────────────────────────────────────────────── */

app.use(express.json());

app.use((req, res, next) => {
    console.log(`🌍 ${req.method} ${req.url}`);
    console.log(`   Origin: ${req.headers.origin || 'No origin'}`);
    next();
});

/* ───────────────────────────────────────────────
   ROUTES
─────────────────────────────────────────────── */

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/test-db', async (req, res) => {
    try {
        await prisma.$connect();
        const userCount = await prisma.user.count();

        res.json({
            status: 'success',
            message: 'Database connection working!',
            userCount,
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: err.message
        });
    }
});

/* ───────────────────────────────────────────────
   404 HANDLER
─────────────────────────────────────────────── */

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

/* ───────────────────────────────────────────────
   ERROR HANDLER
─────────────────────────────────────────────── */

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'CORS policy violation' });
    }

    res.status(500).json({ error: 'Internal server error' });
});

/* ───────────────────────────────────────────────
   START SERVER
─────────────────────────────────────────────── */

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Connected to database successfully');
    } catch (error) {
        console.error('❌ Failed to connect to database:', error);
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 StyleSwap API running on port ${PORT}`);
        console.log(`🌍 Listening on 0.0.0.0:${PORT}\n`);

        if (!process.env.DATABASE_URL) {
            console.warn('⚠️ DATABASE_URL is missing');
        }
    });
};

startServer();
