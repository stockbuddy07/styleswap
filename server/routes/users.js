const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/users — Admin: all users ───────────────────────────────────────
router.get('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, name: true, email: true, role: true,
                shopName: true, shopAddress: true, shopNumber: true,
                mobileNumber: true, salesHandlerMobile: true, gstNumber: true,
                status: true, avatar: true, onboardedAt: true, createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// ─── PUT /api/users/:id — Update user profile ────────────────────────────────
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        // Users can only update themselves; admins can update anyone
        if (req.user.id !== id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const {
            name, shopName, shopAddress, shopNumber,
            mobileNumber, salesHandlerMobile, gstNumber,
            status, avatar, onboardedAt,
        } = req.body;

        const updated = await prisma.user.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(shopName !== undefined && { shopName }),
                ...(shopAddress !== undefined && { shopAddress }),
                ...(shopNumber !== undefined && { shopNumber }),
                ...(mobileNumber !== undefined && { mobileNumber }),
                ...(salesHandlerMobile !== undefined && { salesHandlerMobile }),
                ...(gstNumber !== undefined && { gstNumber }),
                ...(status !== undefined && req.user.role === 'Admin' && { status }),
                ...(avatar !== undefined && { avatar }),
                ...(onboardedAt !== undefined && { onboardedAt: new Date(onboardedAt) }),
            },
            select: {
                id: true, name: true, email: true, role: true,
                shopName: true, shopAddress: true, shopNumber: true,
                mobileNumber: true, salesHandlerMobile: true, gstNumber: true,
                status: true, avatar: true, onboardedAt: true, createdAt: true,
            },
        });

        res.json(updated);
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// ─── DELETE /api/users/:id — Admin: delete user ──────────────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
