import { Router, Request, Response, NextFunction } from 'express';
import { getLayouts, saveLayout, deleteLayout } from '../controllers/layouts.controller';
import { authenticate } from '../middleware/auth.middleware';
import { get } from '../db';

const router = Router();

// Restrict mutating operations to ADMIN only
const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;
    const userRow = await get<any>('SELECT role FROM User WHERE id = ?', [userId]);
    if (userRow?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Admin only' });
    }
    next();
};

router.use(authenticate);

router.get('/', getLayouts);
router.post('/', adminOnly, saveLayout);
router.delete('/:id', adminOnly, deleteLayout);

export default router;
