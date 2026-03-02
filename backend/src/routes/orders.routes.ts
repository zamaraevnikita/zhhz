import { Router } from 'express';
import { getOrders, getOrder, createOrder, updateOrderStatus } from '../controllers/orders.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Secure all order routes
router.use(authenticate);

router.get('/', getOrders);
router.post('/', createOrder);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;
