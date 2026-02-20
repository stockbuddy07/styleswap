const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const settingsPath = path.join(__dirname, '../data/settings.json');

// Helper to read settings
const readSettings = () => {
    try {
        if (!fs.existsSync(settingsPath)) {
            const defaultSettings = { maintenanceMode: false, commissionRate: 15 };
            fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
            fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
            return defaultSettings;
        }
        return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (err) {
        console.error('Read Settings Error:', err);
        return { maintenanceMode: false, commissionRate: 15 };
    }
};

// Helper to write settings
const writeSettings = (data) => {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('Write Settings Error:', err);
        return false;
    }
};

// GET /api/settings
router.get('/', async (req, res) => {
    res.json(readSettings());
});

// PUT /api/settings — Admin Only
router.put('/', authenticate, requireAdmin, async (req, res) => {
    const current = readSettings();
    const updated = { ...current, ...req.body };
    if (writeSettings(updated)) {
        res.json(updated);
    } else {
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

module.exports = router;
