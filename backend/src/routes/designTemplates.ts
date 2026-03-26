import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db, { run, all, get } from '../db';
import { optionalAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// GET all design templates
router.get('/', async (req, res) => {
    try {
        const rows = await all<any>('SELECT * FROM DesignTemplate ORDER BY createdAt DESC');
        const templates = rows.map(row => ({
            ...row,
            pagePresets: JSON.parse(row.pagePresets || '[]'),
        }));
        res.json(templates);
    } catch (err) {
        console.error('Error fetching design templates', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET by ID
router.get('/:id', async (req, res) => {
    try {
        const row = await get<any>('SELECT * FROM DesignTemplate WHERE id = ?', [req.params.id]);
        if (!row) {
            return res.status(404).json({ error: 'Design template not found' });
        }
        res.json({
            ...row,
            pagePresets: JSON.parse(row.pagePresets || '[]'),
        });
    } catch (err) {
        console.error('Error fetching design template', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// CREATE (Admin only)
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { id, name, description, themeId, previewUrl, pagePresets } = req.body;
        const newId = id || uuidv4();

        if (!name || !themeId || !pagePresets) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await run(
            'INSERT INTO DesignTemplate (id, name, description, themeId, previewUrl, pagePresets) VALUES (?, ?, ?, ?, ?, ?)',
            [newId, name, description, themeId, previewUrl, JSON.stringify(pagePresets)]
        );

        const newTemplate = await get<any>('SELECT * FROM DesignTemplate WHERE id = ?', [newId]);
        res.status(201).json({
            ...newTemplate,
            pagePresets: JSON.parse(newTemplate?.pagePresets || '[]'),
        });
    } catch (err) {
        console.error('Error creating design template', err);
        res.status(500).json({ error: 'Failed to create design template' });
    }
});

// UPDATE (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { name, description, themeId, previewUrl, pagePresets } = req.body;

        await run(
            'UPDATE DesignTemplate SET name = ?, description = ?, themeId = ?, previewUrl = ?, pagePresets = ? WHERE id = ?',
            [name, description, themeId, previewUrl, JSON.stringify(pagePresets), req.params.id]
        );

        const updated = await get<any>('SELECT * FROM DesignTemplate WHERE id = ?', [req.params.id]);
        if (!updated) {
            return res.status(404).json({ error: 'Design template not found' });
        }

        res.json({
            ...updated,
            pagePresets: JSON.parse(updated.pagePresets || '[]'),
        });
    } catch (err) {
        console.error('Error updating design template', err);
        res.status(500).json({ error: 'Failed to update design template' });
    }
});

// DELETE (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await run('DELETE FROM DesignTemplate WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting design template', err);
        res.status(500).json({ error: 'Failed to delete design template' });
    }
});

export default router;
