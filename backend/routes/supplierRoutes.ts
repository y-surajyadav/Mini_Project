import { Router, Response } from 'express';
import { dbStore } from '../models/store.js';
import { authenticateToken, AuthenticatedRequest, requireAdmin } from '../middleware/auth.js';
import { Supplier } from '../models/types.js';

const router = Router();

// GET /api/v1/suppliers
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const suppliers = Array.from(dbStore.suppliers.values());
  return res.json({ success: true, total: suppliers.length, suppliers });
});

// POST /api/v1/suppliers (Admin only)
router.post('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { code, name, contactEmail, contactPhone, leadTimeDays, moq, packSize } = req.body;

  if (!code || !name || !contactEmail) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'Supplier code, name, and contact email are required.'
    });
  }

  const newSupplier: Supplier = {
    id: `sup_${Date.now()}`,
    code,
    name,
    contactEmail,
    contactPhone: contactPhone || '',
    leadTimeDays: Number(leadTimeDays) || 3,
    moq: Number(moq) || 50,
    packSize: Number(packSize) || 10,
    active: true,
    createdAt: new Date().toISOString()
  };

  dbStore.suppliers.set(newSupplier.id, newSupplier);
  dbStore.recordAudit(req.user!.id, req.user!.username, 'CREATE_SUPPLIER', 'Supplier', { code, name }, newSupplier.id);

  return res.status(201).json({ success: true, supplier: newSupplier });
});

export default router;
