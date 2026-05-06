import express from 'express';
import { getVendors, createVendor } from '../Controller/vendorController.js';
import { verifyToken, allowRole } from '../middleware/rbac.js';

const router = express.Router();

router.use(verifyToken);

router.get('/',  getVendors);
router.post('/', allowRole('OPS', 'FINANCE'), createVendor);

export default router;
