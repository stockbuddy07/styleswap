const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, requireAdmin } = require('../middleware/auth');

// POST /api/marketing/subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const normalizedEmail = email.toLowerCase().trim();

        const existing = await prisma.subscriber.findUnique({
            where: { email: normalizedEmail }
        });

        if (existing) {
            return res.status(400).json({ error: 'Email is already subscribed' });
        }

        const newSubscriber = await prisma.subscriber.create({
            data: { email: normalizedEmail }
        });

        res.status(201).json({ message: 'Successfully subscribed', subscriber: newSubscriber });
    } catch (error) {
        console.error('📢 Subscribe Error:', error);
        res.status(500).json({ error: 'Failed to subscribe', details: error.message });
    }
});

// GET /api/marketing/subscribers — Admin Only
router.get('/subscribers', authenticate, requireAdmin, async (req, res) => {
    console.log('📬 GET /api/marketing/subscribers requested by:', req.user.email);
    try {
        const subscribers = await prisma.subscriber.findMany({
            orderBy: { subscribedAt: 'desc' }
        });
        console.log(`✅ Found ${subscribers.length} subscribers`);
        res.json(subscribers);
    } catch (error) {
        console.error('❌ Fetch Subscribers Error:', error);
        res.status(500).json({ error: 'Failed to fetch subscribers', details: error.message });
    }
});

// POST /api/marketing/send-newsletter — Admin Only
router.post('/send-newsletter', authenticate, requireAdmin, async (req, res) => {
    try {
        const { subject, content } = req.body;
        if (!subject || !content) {
            return res.status(400).json({ error: 'Subject and content are required' });
        }

        // In a real app, this would trigger an email service
        console.log(`📢 Broadcasting Newsletter: ${subject}`);

        res.json({ message: 'Newsletter broadcast initiated successfully' });
    } catch (error) {
        console.error('Newsletter Error:', error);
        res.status(500).json({ error: 'Failed to send newsletter' });
    }
});

// DELETE /api/marketing/subscribers/:email — Admin Only
router.delete('/subscribers/:email', authenticate, requireAdmin, async (req, res) => {
    try {
        const { email } = req.params;
        await prisma.subscriber.delete({ where: { email } });
        res.json({ message: 'Subscriber removed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove subscriber' });
    }
});

module.exports = router;
