import { Request, Response } from 'express';
import { get, all, run } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Helper: safely parse JSON from DB, returning fallback on failure
const safeJsonParse = (str: string | null | undefined, fallback: any = []) => {
    if (!str) return fallback;
    try { return JSON.parse(str); } catch { return fallback; }
};

const orderItemSchema = z.object({
    projectId: z.string().max(100),
    quantity: z.number().min(1),
    pricePerUnit: z.number().min(0),
    name: z.string().optional(),
    themeId: z.string().optional(),
    id: z.string().optional(), // Match backend if provided
    type: z.string().optional(), // Match backend if provided
    price: z.number().optional() // Match backend if provided
}).passthrough();

const createOrderSchema = z.object({
    totalAmount: z.number().positive("Amount must be positive"),
    items: z.array(orderItemSchema).min(1, "Order must have at least one item").max(200, "Maximum 200 items allowed per order"),
    customerName: z.string().max(100).optional().default(''),
    customerPhone: z.string().max(50).optional().default(''),
    customerEmail: z.string().email("Invalid email").max(100).nullable().optional()
});

const updateOrderStatusSchema = z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'])
});

export const getOrders = async (req: Request, res: Response) => {
    try {
        const { userId } = (req as AuthenticatedRequest).user!;

        // Fetch fresh role from DB to prevent token caching issues
        const userRow = await get<any>('SELECT role FROM User WHERE id = ?', [userId]);
        const trueRole = userRow?.role || 'USER';

        const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 200);
        const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

        let orders;
        if (trueRole === 'ADMIN') {
            orders = await all<any>(`SELECT * FROM \`Order\` ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [limit, offset]);
        } else {
            orders = await all<any>(`SELECT * FROM \`Order\` WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [userId, limit, offset]);
        }

        const mapped = orders.map(o => ({
            ...o,
            items: safeJsonParse(o.items)
        }));

        res.json(mapped);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

export const getOrder = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { userId } = (req as AuthenticatedRequest).user!;

        // Fetch fresh role from DB
        const userRow = await get<any>('SELECT role FROM User WHERE id = ?', [userId]);
        const trueRole = userRow?.role || 'USER';

        const order = await get<any>(`SELECT * FROM \`Order\` WHERE id = ?`, [id]);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (order.userId !== userId && trueRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json({
            ...order,
            items: safeJsonParse(order.items)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { userId } = (req as AuthenticatedRequest).user!;

        const parseResult = createOrderSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Invalid order data', details: parseResult.error.issues });
        }

        const { items, customerName, customerPhone, customerEmail } = parseResult.data;

        const id = uuidv4();
        
        let calculatedTotal = 0;
        const verifiedItems = [];

        for (const item of items) {
             // 1. Fetch the authentic price from the database
             const project = await get<any>('SELECT price FROM Project WHERE id = ?', [item.projectId]);
             if (!project) return res.status(404).json({ error: `Проект ${item.projectId} не найден.` });
             
             // 2. Parse the price (fallback to 6500 if project has no price set)
             const realPrice = parseInt(project.price) || 6500; 
             calculatedTotal += realPrice * item.quantity;
             
             // 3. Override client-provided prices with authentic ones
             verifiedItems.push({
                 ...item,
                 pricePerUnit: realPrice,
                 price: realPrice * item.quantity 
             });
        }

        const itemsStr = JSON.stringify(verifiedItems);

        await run(
            `INSERT INTO \`Order\` (id, userId, status, totalAmount, items, customerName, customerPhone, customerEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, userId, 'PENDING', calculatedTotal, itemsStr, customerName || '', customerPhone || '', customerEmail || null]
        );

        const order = await get<any>(`SELECT * FROM \`Order\` WHERE id = ?`, [id]);

        res.status(201).json({
            ...order,
            items: safeJsonParse(order?.items)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { userId } = (req as AuthenticatedRequest).user!;

        const parseResult = updateOrderStatusSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Invalid status update', details: parseResult.error.issues });
        }

        const { status } = parseResult.data;

        // Fetch fresh role from DB — do NOT trust the JWT role here
        const userRow = await get<any>('SELECT role FROM User WHERE id = ?', [userId]);
        const trueRole = userRow?.role || 'USER';

        if (trueRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: Only admins can update order status' });
        }

        const existing = await get<any>(`SELECT * FROM \`Order\` WHERE id = ?`, [id]);
        if (!existing) return res.status(404).json({ error: 'Order not found' });

        await run(
            `UPDATE \`Order\` SET status=?, updatedAt=CURRENT_TIMESTAMP WHERE id=?`,
            [status, id]
        );

        const order = await get<any>(`SELECT * FROM \`Order\` WHERE id = ?`, [id]);
        res.json({ ...order, items: safeJsonParse(order?.items) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
