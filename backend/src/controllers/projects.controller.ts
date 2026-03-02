import { Request, Response } from 'express';
import { get, all, run, runTransaction } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const projectSpreadSlotSchema = z.object({
    id: z.string().max(50),
    type: z.enum(['image', 'text']),
    rect: z.object({
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
        w: z.number().min(0).max(100),
        h: z.number().min(0).max(100)
    }).optional(),
    content: z.string().max(5000).optional(),
    src: z.string().optional(), // Can be very long as it's base64 for now, relying on global 50mb limit
    className: z.string().max(255).optional().default(''),
    rotation: z.number().optional(),
    opacity: z.number().min(0).max(1).optional(),
    borderRadius: z.number().optional(),
    isBackground: z.boolean().optional(),
    zIndex: z.number().optional()
}).passthrough();

const projectSpreadSchema = z.object({
    id: z.string().max(50),
    type: z.enum(['cover', 'regular', 'flyleaf']).optional(),
    slots: z.array(projectSpreadSlotSchema).max(50, "Max 50 slots per spread")
}).passthrough();

const createProjectSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    themeId: z.string().min(1, "Theme ID is required").max(50),
    isCustom: z.boolean().optional().default(false),
    spreads: z.array(projectSpreadSchema).max(150, "Max 150 spreads to prevent JSON bombs").optional().default([]),
    price: z.number().int().positive().optional().nullable(),
    previewUrl: z.string().url().max(1000).optional().nullable()
});

const updateProjectSchema = createProjectSchema.partial();

export const getProjects = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.json([]);
        }

        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const projects = await all<any>(
            `SELECT * FROM Project WHERE userId = ? ORDER BY updatedAt DESC LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        const mapped = projects.map(p => ({
            ...p,
            isCustom: Boolean(p.isCustom),
            spreads: JSON.parse(p.spreads)
        }));

        res.json(mapped);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

export const getProject = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = (req as any).user?.userId;
        const role = (req as any).user?.role;

        const project = await get<any>(`SELECT * FROM Project WHERE id = ?`, [id]);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        // Only project owner or admin can view a project
        if (project.userId && project.userId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json({
            ...project,
            isCustom: Boolean(project.isCustom),
            spreads: JSON.parse(project.spreads)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        // userId MUST come from the JWT, not the request body
        const userId = (req as any).user?.userId || null;

        const parseResult = createProjectSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Invalid project data', details: parseResult.error.issues });
        }

        const { name, themeId, isCustom, spreads, price, previewUrl } = parseResult.data;

        const id = uuidv4();
        const isCustomInt = isCustom ? 1 : 0;
        const spreadsStr = JSON.stringify(spreads || []);

        await run(
            `INSERT INTO Project (id, userId, name, themeId, isCustom, spreads, price, previewUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, userId, name, themeId, isCustomInt, spreadsStr, price || null, previewUrl || null]
        );

        const project = await get<any>(`SELECT * FROM Project WHERE id = ?`, [id]);

        res.status(201).json({
            ...project,
            isCustom: Boolean(project?.isCustom),
            spreads: JSON.parse(project?.spreads || '[]')
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create project' });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const updates = req.body;
        const userId = (req as any).user?.userId;
        const role = (req as any).user?.role;

        const existing = await get<any>(`SELECT * FROM Project WHERE id = ?`, [id]);
        if (!existing) return res.status(404).json({ error: 'Not found' });

        // Ownership check: only the owner or admin can update
        if (existing.userId && existing.userId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const parseResult = updateProjectSchema.safeParse(updates);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Invalid project update data', details: parseResult.error.issues });
        }

        const validUpdates = parseResult.data;

        const newName = validUpdates.name !== undefined ? validUpdates.name : existing.name;
        const newThemeId = validUpdates.themeId !== undefined ? validUpdates.themeId : existing.themeId;
        const newIsCustom = validUpdates.isCustom !== undefined ? (validUpdates.isCustom ? 1 : 0) : existing.isCustom;
        const newPrice = validUpdates.price !== undefined ? validUpdates.price : existing.price;
        const newSpreads = validUpdates.spreads !== undefined ? JSON.stringify(validUpdates.spreads) : existing.spreads;
        const newPreviewUrl = validUpdates.previewUrl !== undefined ? validUpdates.previewUrl : existing.previewUrl;
        // NOTE: userId cannot be changed via update — it stays as-is
        const existingUserId = existing.userId;

        await run(
            `UPDATE Project SET name=?, themeId=?, isCustom=?, price=?, spreads=?, previewUrl=?, userId=?, updatedAt=CURRENT_TIMESTAMP WHERE id=?`,
            [newName, newThemeId, newIsCustom, newPrice, newSpreads, newPreviewUrl, existingUserId, id]
        );

        const project = await get<any>(`SELECT * FROM Project WHERE id = ?`, [id]);

        res.json({
            ...project,
            isCustom: Boolean(project?.isCustom),
            spreads: JSON.parse(project?.spreads || '[]')
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update project' });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = (req as any).user?.userId;
        const role = (req as any).user?.role;

        const existing = await get<any>(`SELECT * FROM Project WHERE id = ?`, [id]);
        if (!existing) return res.status(404).json({ error: 'Project not found' });

        // Ownership check: only the owner or admin can delete
        if (existing.userId && existing.userId !== userId && role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await run(`DELETE FROM Project WHERE id = ?`, [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
};

/**
 * PATCH /api/projects/claim
 * Associates guest projects (userId = NULL) with the authenticated user.
 * Used after login to reclaim projects created as a guest.
 */
export const claimProjects = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { projectIds } = req.body;
        if (!Array.isArray(projectIds) || projectIds.length === 0) {
            return res.json({ claimed: 0 });
        }

        // Limit the batch size to prevent DoS
        const batchSize = Math.min(projectIds.length, 50);
        const validIds = projectIds.slice(0, batchSize).filter(id => typeof id === 'string');

        if (validIds.length === 0) {
            return res.json({ claimed: 0 });
        }

        // Find which of these projects actually have no owner (guest projects)
        const placeholders = validIds.map(() => '?').join(',');
        const projects = await all<any>(
            `SELECT id FROM Project WHERE userId IS NULL AND id IN (${placeholders})`,
            validIds
        );

        const projectIdsToClaim = projects.map(p => p.id);

        if (projectIdsToClaim.length === 0) {
            return res.json({ claimed: 0 });
        }

        // Construct update queries for the transaction
        const queries = projectIdsToClaim.map(id => ({
            sql: `UPDATE Project SET userId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            params: [userId, id]
        }));

        await runTransaction(queries);

        res.json({ claimed: projectIdsToClaim.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to claim projects' });
    }
};
