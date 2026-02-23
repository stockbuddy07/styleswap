const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/cart — Retrieve user's cart items ─────────────────────────────
router.get('/', authenticate, async (req, res) => {
    try {
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: req.user.id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        images: true,
                        category: true,
                        pricePerDay: true,
                        securityDeposit: true,
                        subAdminId: true,
                        vendor: {
                            select: {
                                shopName: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to a cleaner format for the frontend
        const formatted = cartItems.map(item => {
            let images = [];
            try {
                images = typeof item.product.images === 'string' ? JSON.parse(item.product.images) : (item.product.images || []);
            } catch (e) {
                images = [item.product.images];
            }
            if (!Array.isArray(images)) images = [images];

            return {
                id: item.id,
                productId: item.product.id,
                productName: item.product.name,
                productImage: images[0] || '',
                category: item.product.category,
                vendorId: item.product.subAdminId,
                vendorShopName: item.product.vendor?.shopName || 'Luxury Curator',
                pricePerDay: item.product.pricePerDay,
                securityDeposit: item.product.securityDeposit,
                size: item.size,
                quantity: item.quantity,
                rentalStartDate: item.rentalStartDate,
                rentalEndDate: item.rentalEndDate,
                createdAt: item.createdAt,
            };
        });

        res.json(formatted);
    } catch (err) {
        console.error('Fetch cart error:', err);
        res.status(500).json({ error: 'Failed to retrieve manifest' });
    }
});

// ─── POST /api/cart — Add/Sync item to cart ──────────────────────────────────
router.post('/', authenticate, async (req, res) => {
    try {
        const { productId, quantity, size, rentalStartDate, rentalEndDate } = req.body;

        if (!productId || !size || !rentalStartDate || !rentalEndDate) {
            return res.status(400).json({ error: 'Missing acquisition parameters' });
        }

        // Check if item already exists with same size (merging logic)
        // We relax the check to only productId and size to prevent duplicates in the UI
        const existing = await prisma.cartItem.findFirst({
            where: {
                userId: req.user.id,
                productId,
                size
            }
        });

        if (existing) {
            const updated = await prisma.cartItem.update({
                where: { id: existing.id },
                data: {
                    quantity: existing.quantity + (quantity || 1),
                    rentalStartDate: rentalStartDate, // Update to latest selected dates
                    rentalEndDate: rentalEndDate
                }
            });
            return res.json(updated);
        }

        const newItem = await prisma.cartItem.create({
            data: {
                userId: req.user.id,
                productId,
                quantity: quantity || 1,
                size,
                rentalStartDate,
                rentalEndDate
            }
        });

        res.status(201).json(newItem);
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ error: 'Failed to lock asset in manifest' });
    }
});

// ─── PUT /api/cart/:id — Update item details ─────────────────────────────────
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, size, rentalStartDate, rentalEndDate } = req.body;

        const item = await prisma.cartItem.findUnique({ where: { id } });
        if (!item || item.userId !== req.user.id) {
            return res.status(404).json({ error: 'Asset not found in manifest' });
        }

        const updated = await prisma.cartItem.update({
            where: { id },
            data: {
                quantity: quantity !== undefined ? quantity : item.quantity,
                size: size || item.size,
                rentalStartDate: rentalStartDate || item.rentalStartDate,
                rentalEndDate: rentalEndDate || item.rentalEndDate
            }
        });

        res.json(updated);
    } catch (err) {
        console.error('Update cart error:', err);
        res.status(500).json({ error: 'Failed to update manifest details' });
    }
});

// ─── DELETE /api/cart/:id — Remove item ──────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const item = await prisma.cartItem.findUnique({ where: { id } });

        if (!item || item.userId !== req.user.id) {
            return res.status(404).json({ error: 'Asset not found in manifest' });
        }

        await prisma.cartItem.delete({ where: { id } });
        res.json({ message: 'Asset released from manifest' });
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({ error: 'Failed to release asset' });
    }
});

// ─── DELETE /api/cart — Clear cart ──────────────────────────────────────────
router.delete('/', authenticate, async (req, res) => {
    try {
        await prisma.cartItem.deleteMany({
            where: { userId: req.user.id }
        });
        res.json({ message: 'Manifest dissolved' });
    } catch (err) {
        console.error('Clear cart error:', err);
        res.status(500).json({ error: 'Failed to dissolve manifest' });
    }
});

module.exports = router;
