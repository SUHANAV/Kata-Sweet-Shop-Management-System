import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import * as sweetsController from '../controllers/sweetsController';

const router = Router();

router.post('/', requireAuth, requireAdmin, sweetsController.create);
router.get('/', requireAuth, sweetsController.list);
router.get('/search', requireAuth, sweetsController.search);
router.put('/:id', requireAuth, requireAdmin, sweetsController.update);
router.delete('/:id', requireAuth, requireAdmin, sweetsController.remove);
router.post('/:id/purchase', requireAuth, sweetsController.purchase);
router.post('/:id/restock', requireAuth, requireAdmin, sweetsController.restock);

export default router;
