import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import datasetRoutes from './datasetRoutes.js';
import mlRoutes from './mlRoutes.js';
import auditRoutes from './auditRoutes.js';
import reportsRoutes from './reportsRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/dataset', datasetRoutes);
router.use('/ml', mlRoutes);
router.use('/audit', auditRoutes);
router.use('/reports', reportsRoutes);

export default router;
