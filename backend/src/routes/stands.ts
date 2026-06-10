import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';
import { calculateStandStats, calculateFloorPrices, Transaction } from '../utils/calculations';

const router = Router();

function getStandWithEvent(standId: string, userId: string, res: Response): any | null {
  const stand = db.prepare('SELECT s.*, e.commission_rate, e.access_code FROM stands s JOIN events e ON s.event_id = e.id WHERE s.id = ?').get(standId) as any;
  if (!stand) { res.status(404).json({ error: 'Stand not found' }); return null; }
  if (stand.owner_id !== userId) { res.status(403).json({ error: 'Forbidden' }); return null; }
  return stand;
}

function getTransactions(standId: string): Transaction[] {
  return db.prepare('SELECT * FROM transactions WHERE stand_id = ? ORDER BY created_at DESC').all(standId) as Transaction[];
}

router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const stand = getStandWithEvent(req.params.id, req.user!.id, res);
  if (!stand) return;
  const products = db.prepare('SELECT * FROM products WHERE stand_id = ? AND is_active = 1 ORDER BY sort_order').all(stand.id);
  const cashiers = db.prepare('SELECT id, name, is_active FROM cashiers WHERE stand_id = ?').all(stand.id);
  res.json({ stand, products, cashiers });
});

router.put('/:id', authenticateToken,
  body('name').trim().isLength({ min: 2 }).optional(),
  body('standCost').isFloat({ min: 0 }).optional(),
  body('inventoryCost').isFloat({ min: 0 }).optional(),
  handleValidationErrors,
  (req: Request, res: Response) => {
    const stand = getStandWithEvent(req.params.id, req.user!.id, res);
    if (!stand) return;
    const { name, standCost, inventoryCost } = req.body;
    db.prepare('UPDATE stands SET name = COALESCE(?, name), stand_cost = COALESCE(?, stand_cost), inventory_cost = COALESCE(?, inventory_cost) WHERE id = ?')
      .run(name ?? null, standCost ?? null, inventoryCost ?? null, stand.id);
    res.json({ stand: db.prepare('SELECT * FROM stands WHERE id = ?').get(stand.id) });
  }
);

router.get('/:id/stats', authenticateToken, (req: Request, res: Response) => {
  const stand = getStandWithEvent(req.params.id, req.user!.id, res);
  if (!stand) return;
  const transactions = getTransactions(stand.id);
  const stats = calculateStandStats(transactions, stand.stand_cost, stand.inventory_cost, stand.commission_rate);
  res.json({ stats });
});

router.get('/:id/panic', authenticateToken, (req: Request, res: Response) => {
  const stand = getStandWithEvent(req.params.id, req.user!.id, res);
  if (!stand) return;
  const transactions = getTransactions(stand.id);
  const stats = calculateStandStats(transactions, stand.stand_cost, stand.inventory_cost, stand.commission_rate);
  const products = db.prepare('SELECT * FROM products WHERE stand_id = ? AND is_active = 1').all(stand.id) as any[];

  const totalStock = products.reduce((sum: number, p: any) => sum + p.stock, 1);
  const recommendations = products.map((p: any) => {
    const floors = calculateFloorPrices(p.cost_price, stand.commission_rate, stand.stand_cost, stand.inventory_cost, totalStock);
    const canDiscount = p.price > floors.floorPrice;
    const maxDiscountPct = canDiscount ? Math.floor(((p.price - floors.floorPrice) / p.price) * 100) : 0;
    const urgency = stats.breakEvenProgress < 50 ? 'critical' : stats.breakEvenProgress < 100 ? 'warning' : 'safe';
    return { ...p, ...floors, canDiscount, maxDiscountPct, urgency };
  });

  res.json({ stats, recommendations, breakEvenRemaining: Math.max(0, stats.breakEven - stats.netRevenue) });
});

router.post('/:id/cashiers', authenticateToken,
  body('name').trim().isLength({ min: 2 }),
  body('pin').isLength({ min: 4, max: 6 }),
  handleValidationErrors,
  (req: Request, res: Response) => {
    const stand = getStandWithEvent(req.params.id, req.user!.id, res);
    if (!stand) return;
    const { name, pin } = req.body;
    const id = uuidv4();
    db.prepare('INSERT INTO cashiers (id, stand_id, name, pin) VALUES (?, ?, ?, ?)').run(id, stand.id, name, pin);
    res.status(201).json({ cashier: { id, name, is_active: 1 } });
  }
);

router.delete('/:standId/cashiers/:cashierId', authenticateToken, (req: Request, res: Response) => {
  const stand = getStandWithEvent(req.params.standId, req.user!.id, res);
  if (!stand) return;
  db.prepare('DELETE FROM cashiers WHERE id = ? AND stand_id = ?').run(req.params.cashierId, stand.id);
  res.json({ success: true });
});

export default router;
