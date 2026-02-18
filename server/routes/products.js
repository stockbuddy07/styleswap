const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireVendor } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/products — All products (public) ───────────────────────────────
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                vendor: {
                    select: { id: true, name: true, shopName: true, email: true },
                },
            },
        });
        const parsed = products.map(p => ({
            ...p,
            sizes: p.sizes || [],
            images: p.images || [],
        }));
        res.json(parsed);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// ─── GET /api/products/mine — Vendor's own products ──────────────────────────
router.get('/mine', authenticate, requireVendor, async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { subAdminId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        const parsed = products.map(p => ({
            ...p,
            sizes: p.sizes || [],
            images: p.images || [],
        }));
        res.json(parsed);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch your products' });
    }
});

// ─── POST /api/products — Create product (vendor) ────────────────────────────
router.post('/', authenticate, requireVendor, async (req, res) => {
    try {
        const {
            name, category, description, pricePerDay,
            securityDeposit, stockQuantity, sizes, images,
        } = req.body;

        if (!name || !category || !description || !pricePerDay || stockQuantity === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const product = await prisma.product.create({
            data: {
                name,
                category,
                description,
                pricePerDay: Number(pricePerDay),
                securityDeposit: Number(securityDeposit || 0),
                stockQuantity: Number(stockQuantity),
                availableQuantity: Number(stockQuantity),
                sizes: sizes || [],
                images: images || [],
                subAdminId: req.user.id,
            },
        });

        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// ─── PUT /api/products/:id — Update product ───────────────────────────────────
router.put('/:id', authenticate, requireVendor, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Product not found' });
        if (existing.subAdminId !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const {
            name, category, description, pricePerDay,
            securityDeposit, stockQuantity, availableQuantity, sizes, images,
        } = req.body;

        const updated = await prisma.product.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(category !== undefined && { category }),
                ...(description !== undefined && { description }),
                ...(pricePerDay !== undefined && { pricePerDay: Number(pricePerDay) }),
                ...(securityDeposit !== undefined && { securityDeposit: Number(securityDeposit) }),
                ...(stockQuantity !== undefined && { stockQuantity: Number(stockQuantity) }),
                ...(availableQuantity !== undefined && { availableQuantity: Number(availableQuantity) }),
                ...(sizes !== undefined && { sizes }),
                ...(images !== undefined && { images }),
            },
        });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
router.delete('/:id', authenticate, requireVendor, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Product not found' });
        if (existing.subAdminId !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// ─── PATCH /api/products/:id/availability — Update stock ─────────────────────
router.patch('/:id/availability', authenticate, async (req, res) => {
    try {
        const { delta } = req.body; // +1 or -1
        const product = await prisma.product.findUnique({ where: { id: req.params.id } });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const newQty = Math.max(0, Math.min(product.stockQuantity, product.availableQuantity + Number(delta)));
        const updated = await prisma.product.update({
            where: { id: req.params.id },
            data: { availableQuantity: newQty },
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update availability' });
    }
});

module.exports = router;
