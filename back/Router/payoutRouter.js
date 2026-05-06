import express from 'express';
import {
  createPayout, getPayouts, getPayoutById,
  submitPayout, approvePayout, rejectPayout, getStats
} from '../Controller/payoutController.js';
import { verifyToken, allowRole } from '../middleware/rbac.js';

const router = express.Router();

router.use(verifyToken);

router.post('/',                allowRole('OPS'),     createPayout);
router.get('/',                 getPayouts);
router.get('/stats',            getStats);
router.get('/:id',              getPayoutById);

router.post('/:id/submit',      allowRole('OPS'),     submitPayout);
router.post('/:id/approve',     allowRole('FINANCE'), approvePayout);
router.post('/:id/reject',      allowRole('FINANCE'), rejectPayout);

export default router;
