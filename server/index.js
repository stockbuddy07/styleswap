const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://styleswap-tau.vercel.app',
    process.env.CLIENT_URL_PROD,
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        console.warn(`CORS blocked origin: ${origin}`);
        // Still call callback with false — don't throw, so error handler can respond
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
// console.log('🔑 CLIENT_URL:', process.env.CLIENT_URL || '[NOT SET]');

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
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 StyleSwap API running on http://localhost:${PORT}`);
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
        console.error(`🚨 CRITICAL ERROR: DATABASE_URL is MISSING!`);
    }
});
