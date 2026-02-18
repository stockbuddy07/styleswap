const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS Configuration ───────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5175',
    'https://styleswap-tau.vercel.app',
    'https://styleswap-production.up.railway.app'
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);

        // Check against allowed list or matching vercel.app subdomain
        if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
            return callback(null, true);
        }

        console.warn(`⚠️ CORS blocked: ${origin}`);
        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

// Apply CORS to all routes (including preflight OPTIONS)
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Debug logging
console.log('🚀 Server starting...');
console.log('🔌 DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[MISSING]');

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.get('/api/test-db', async (req, res) => {
    try {
        await prisma.$connect();
        const userCount = await prisma.user.count();
        res.json({
            status: 'success',
            message: 'Database connection working!',
            userCount,
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                urlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) + '...' : 'N/A'
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: err.message,
            stack: err.stack
        });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Start ───────────────────────────────────────────────────────────────────
const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Connected to database successfully');
    } catch (error) {
        console.error('❌ Failed to connect to database:', error);
        // We don't exit here to allow the server to start, but requests will likely fail
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 StyleSwap API running on port ${PORT}`);
        console.log(`   URL: http://0.0.0.0:${PORT}`);
        console.log(`📊 Prisma Studio: run "npm run db:studio" to view data\n`);

        // DEBUG: Check DATABASE_URL format (masked for security)
        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl) {
            console.log(`🔍 DEBUG: DATABASE_URL is set.`);
            console.log(`   Length: ${dbUrl.length}`);
            console.log(`   Starts with: ${dbUrl.substring(0, 15)}...`);
            if (dbUrl.startsWith('"') || dbUrl.startsWith("'")) {
                console.error(`🚨 CRITICAL ERROR: DATABASE_URL starts with a quote! Please remove it in Railway Variables.`);
            }
        } else {
            console.log(`⚠️  WARNING: DATABASE_URL is MISSING! API endpoints requiring DB will fail.`);
        }
    });
};

startServer();
