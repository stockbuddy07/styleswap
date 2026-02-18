const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── Helper to ensure JSON fields are returned correctly ─────────────────────
// With native Json type, Prisma returns objects. We might not need this helper anymore
// but we keep it to ensure consistent structure if any processing is needed.
const parseOrder = (order) => ({
    ...order,
    items: order.items || [],
    feedback: order.feedback || null,
    issues: order.issues || [],
});

// ─── GET /api/orders — Admin: all orders ─────────────────────────────────────
router.get('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({ orderBy: { orderDate: 'desc' } });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// ─── GET /api/orders/mine — Customer's own orders ────────────────────────────
router.get('/mine', authenticate, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { customerId: req.user.id },
            orderBy: { orderDate: 'desc' },
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch your orders' });
    }
});

// ─── GET /api/orders/vendor — Vendor's orders ────────────────────────────────
router.get('/vendor', authenticate, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { vendorId: req.user.id },
            orderBy: { orderDate: 'desc' },
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch vendor orders' });
    }
});

// ─── POST /api/orders — Place order ──────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            vendorId, shopName, items, totalAmount,
            rentalStartDate, rentalEndDate, paymentMethod,
        } = req.body;

        if (!vendorId || !items || !totalAmount) {
            return res.status(400).json({ error: 'Missing required order fields' });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        const order = await prisma.order.create({
            data: {
                customerId: req.user.id,
                customerName: user?.name || req.user.name,
                vendorId,
                shopName,
                items, // Native JSON
                totalAmount: Number(totalAmount),
                rentalStartDate,
                rentalEndDate,
                paymentMethod: paymentMethod || 'Cash on Delivery',
                status: 'Active',
            },
        });

        res.status(201).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// ─── PUT /api/orders/:id/status — Update order status ────────────────────────
router.put('/:id/status', authenticate, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await prisma.order.findUnique({ where: { id: req.params.id } });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Only vendor, admin, or the customer can update
        const allowed = req.user.role === 'Admin' || order.vendorId === req.user.id || order.customerId === req.user.id;
        if (!allowed) return res.status(403).json({ error: 'Forbidden' });

        const updated = await prisma.order.update({
            where: { id: req.params.id },
            data: { status },
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// ─── PUT /api/orders/:id/feedback — Submit/update feedback ───────────────────
router.put('/:id/feedback', authenticate, async (req, res) => {
    try {
        const { rating, review, tags, itemIndex, itemName } = req.body;
        const order = await prisma.order.findUnique({ where: { id: req.params.id } });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.customerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

        const feedback = {
            rating, review, tags: tags || [],
            itemIndex, itemName,
            submittedAt: new Date().toISOString(),
        };

        const updated = await prisma.order.update({
            where: { id: req.params.id },
            data: { feedback },
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

// ─── POST /api/orders/:id/issues — Raise an issue ────────────────────────────
router.post('/:id/issues', authenticate, async (req, res) => {
    try {
        const { type, description, itemIndex, itemName } = req.body;
        const order = await prisma.order.findUnique({ where: { id: req.params.id } });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.customerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

        const existingIssues = order.issues || [];
        const newIssue = {
            issueId: `issue-${Date.now()}`,
            type, description, itemIndex, itemName,
            status: 'Open',
            raisedAt: new Date().toISOString(),
            adminResponse: null,
        };
        existingIssues.push(newIssue);

        const updated = await prisma.order.update({
            where: { id: req.params.id },
            data: { issues: existingIssues },
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to raise issue' });
    }
});

// ─── PUT /api/orders/:id/issues/:issueId — Admin: update issue status ────────
router.put('/:id/issues/:issueId', authenticate, requireAdmin, async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const order = await prisma.order.findUnique({ where: { id: req.params.id } });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const issues = order.issues || [];
        const idx = issues.findIndex(i => i.issueId === req.params.issueId);
        if (idx === -1) return res.status(404).json({ error: 'Issue not found' });

        issues[idx] = { ...issues[idx], status, adminResponse: adminResponse || null };

        const updated = await prisma.order.update({
            where: { id: req.params.id },
            data: { issues },
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update issue' });
    }
});

module.exports = router;
