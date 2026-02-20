const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/marketing/subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if email already exists
        const existing = await prisma.subscriber.findUnique({
            where: { email }
        });

        if (existing) {
            return res.status(400).json({ error: 'Email is already subscribed' });
        }

        const newSubscriber = await prisma.subscriber.create({
            data: { email }
        });

        res.status(201).json({
            message: 'Successfully subscribed',
            subscriber: newSubscriber
        });
    } catch (error) {
        console.error('Subscribe Error:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// GET /api/marketing/subscribers (Admin only protection should be added here or in middleware)
router.get('/subscribers', async (req, res) => {
    try {
        const subscribers = await prisma.subscriber.findMany({
            orderBy: { subscribedAt: 'desc' }
        });
        res.json(subscribers);
    } catch (error) {
        console.error('Fetch Subscribers Error:', error);
        res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
});

module.exports = router;
