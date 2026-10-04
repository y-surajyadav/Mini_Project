import { Router, Response } from 'express';
import { dbStore } from '../models/store.js';
import { authenticateToken, AuthenticatedRequest, requireAdmin } from '../middleware/auth.js';
import { Product } from '../models/types.js';

const router = Router();

// GET /api/v1/products - List products with search, category filtering
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { search, category, status } = req.query;
  let products = Array.from(dbStore.products.values());

  if (category && typeof category === 'string' && category !== 'ALL') {
    products = products.filter(p => p.category === category);
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    products = products.filter(p => p.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q) ||
      p.binLocation.toLowerCase().includes(q)
    );
  }

  return res.json({
    success: true,
    total: products.length,
    products
  });
});

// GET /api/v1/products/:id
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const product = dbStore.products.get(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  return res.json({ success: true, product });
});

// POST /api/v1/products (Admin only)
router.post('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { 
    sku, 
    name, 
    category, 
    deptId, 
    storeId, 
    unit, 
    onHandStock, 
    safetyStock, 
    supplierId, 
    unitCost, 
    sellingPrice, 
    binLocation 
  } = req.body;

  if (!sku || !name || !category || !supplierId) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'SKU, name, category, and supplier are required.'
    });
  }

  const existing = Array.from(dbStore.products.values()).find(p => p.sku === sku);
  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'DUPLICATE_SKU',
      message: `Product with SKU '${sku}' already exists.`
    });
  }

  const newProd: Product = {
    id: `prod_${Date.now()}`,
    sku,
    name,
    category,
    deptId: deptId || 'GENERAL',
    storeId: storeId || 'CA_3',
    unit: unit || 'Unit',
    onHandStock: Number(onHandStock) || 0,
    safetyStock: Number(safetyStock) || 10,
    confirmedInbound: 0,
    committedDemand: 0,
    supplierId,
    unitCost: Number(unitCost) || 1.0,
    sellingPrice: Number(sellingPrice) || 2.0,
    binLocation: binLocation || 'A-01-01',
    status: 'active',
    isSyntheticDemo: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbStore.products.set(newProd.id, newProd);
  dbStore.recordAudit(req.user!.id, req.user!.username, 'CREATE_PRODUCT', 'Product', { sku, name }, newProd.id);

  return res.status(201).json({ success: true, product: newProd });
});

// PUT /api/v1/products/:id (Admin only)
router.put('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const prod = dbStore.products.get(req.params.id);
  if (!prod) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  const updates = req.body;
  if (updates.name) prod.name = updates.name;
  if (updates.safetyStock !== undefined) prod.safetyStock = Number(updates.safetyStock);
  if (updates.unitCost !== undefined) prod.unitCost = Number(updates.unitCost);
  if (updates.sellingPrice !== undefined) prod.sellingPrice = Number(updates.sellingPrice);
  if (updates.binLocation) prod.binLocation = updates.binLocation;
  if (updates.status) prod.status = updates.status;
  if (updates.supplierId) prod.supplierId = updates.supplierId;
  prod.updatedAt = new Date().toISOString();

  dbStore.recordAudit(req.user!.id, req.user!.username, 'UPDATE_PRODUCT', 'Product', updates, prod.id);

  return res.json({ success: true, product: prod });
});

export default router;
