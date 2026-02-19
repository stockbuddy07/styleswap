const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'styleswap-dev-secret';
console.log('🔑 [Auth] JWT_SECRET loaded. Length:', JWT_SECRET.length, 'Source:', process.env.JWT_SECRET ? 'ENV' : 'FALLBACK');

/**
 * Verify JWT token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('⚠️ [Auth] No token provided for:', req.url);
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('❌ [Auth] Invalid or expired token:', err.message, 'for:', req.url);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Require Admin role.
 */
function requireAdmin(req, res, next) {
    if (req.user?.role !== 'Admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

/**
 * Require Sub-Admin (Vendor) role.
 */
function requireVendor(req, res, next) {
    if (req.user?.role !== 'Sub-Admin' && req.user?.role !== 'Admin') {
        return res.status(403).json({ error: 'Vendor access required' });
    }
    next();
}

/**
 * Generate a JWT token for a user.
 */
function signToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

module.exports = { authenticate, requireAdmin, requireVendor, signToken };
