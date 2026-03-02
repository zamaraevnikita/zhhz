import { Request, Response } from 'express';
import { get, all, run } from '../db';
import { z } from 'zod';

// Define schemas to prevent JSON bombs and type spoofing
const layoutSlotSchema = z.object({
    id: z.string().max(50),
    type: z.enum(['image', 'text']),
    rect: z.object({
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
        w: z.number().min(0).max(100),
        h: z.number().min(0).max(100)
    }).optional(),
    className: z.string().max(255).default(''),
    rotation: z.number().optional(),
    opacity: z.number().min(0).max(1).optional(),
    borderRadius: z.number().optional()
});

const saveLayoutSchema = z.object({
    id: z.string().max(100),
    name: z.string().max(100),
    slots: z.array(layoutSlotSchema).max(50, "Maximum 50 slots allowed to prevent JSON bombs")
});

// GET /api/layouts
export const getLayouts = async (req: Request, res: Response) => {
    try {
        const layouts = await all<any>(`SELECT * FROM LayoutTemplate ORDER BY createdAt DESC`);

        // Parse the slots JSON back to object format before sending
        const mapped = layouts.map(l => ({
            ...l,
            slots: JSON.parse(l.slots)
        }));

        res.json(mapped);
    } catch (error) {
        console.error('getLayouts error:', error);
        res.status(500).json({ error: 'Failed to fetch layouts' });
    }
};

// POST /api/layouts
export const saveLayout = async (req: Request, res: Response) => {
    try {
        // Validate input with Zod
        const parseResult = saveLayoutSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Invalid layout data', details: parseResult.error.issues });
        }

        const { id, name, slots } = parseResult.data;

        const slotsStr = JSON.stringify(slots);

        // Check if layout exists
        const existing = await get<any>(`SELECT id FROM LayoutTemplate WHERE id = ?`, [id]);

        if (existing) {
            await run(`UPDATE LayoutTemplate SET name = ?, slots = ? WHERE id = ?`, [name, slotsStr, id]);
        } else {
            await run(`INSERT INTO LayoutTemplate (id, name, slots) VALUES (?, ?, ?)`, [id, name, slotsStr]);
        }

        res.json({ success: true, id });
    } catch (error) {
        console.error('saveLayout error:', error);
        res.status(500).json({ error: 'Failed to save layout' });
    }
};

// DELETE /api/layouts/:id
export const deleteLayout = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await run(`DELETE FROM LayoutTemplate WHERE id = ?`, [id]);
        res.json({ success: true, deleted: id });
    } catch (error) {
        console.error('deleteLayout error:', error);
        res.status(500).json({ error: 'Failed to delete layout' });
    }
};
