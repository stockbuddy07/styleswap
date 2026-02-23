const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate } = require('../middleware/auth');

// ─── GET /api/wishlist — Fetch user's wishlist ──────────────────────────────
router.get('/', authenticate, async (req, res) => {
    try {
        const wishlist = await prisma.wishlistItem.findMany({
            where: { userId: req.user.id },
            include: {
                product: {
                    include: {
                        vendor: {
                            select: { id: true, shopName: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Flatten product data for frontend
        const items = wishlist.map(item => ({
            ...item,
            ...item.product,
            id: item.id, // WishlistItem ID
            productId: item.productId,
            shopName: item.product.vendor?.shopName || 'Premium Store',
            product: undefined // Remove nested product object
        }));

        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

// ─── POST /api/wishlist — Add item to wishlist ──────────────────────────────
router.post('/', authenticate, async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        const item = await prisma.wishlistItem.upsert({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId: productId,
                },
            },
            update: {}, // Do nothing if already exists
            create: {
                userId: req.user.id,
                productId: productId,
            },
            include: {
                product: {
                    include: {
                        vendor: {
                            select: { id: true, shopName: true }
                        }
                    }
                }
            }
        });

        const flattened = {
            ...item,
            ...item.product,
            id: item.id,
            productId: item.productId,
            shopName: item.product.vendor?.shopName || 'Premium Store',
            product: undefined
        };

        res.status(201).json(flattened);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

// ─── DELETE /api/wishlist/:id — Remove from wishlist ────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await prisma.wishlistItem.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'Removed from wishlist' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

// ─── DELETE /api/wishlist/product/:productId — Remove by productId ───────────
router.delete('/product/:productId', authenticate, async (req, res) => {
    try {
        await prisma.wishlistItem.delete({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId: req.params.productId,
                },
            },
        });
        res.json({ message: 'Removed from wishlist' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

module.exports = router;
