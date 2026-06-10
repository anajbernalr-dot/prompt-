import { Router, Request, Response } from 'express';
import Papa from 'papaparse';
import db from '../db/database';
import { authenticateToken } from '../middleware/auth';
import { calculateStandStats } from '../utils/calculations';

const router = Router();

router.get('/stands/:standId/export/csv', authenticateToken, (req: Request, res: Response) => {
  try {
    const stand = db.prepare('SELECT * FROM stands WHERE id = ?').get(req.params.standId) as any;
    if (!stand || stand.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    const transactions = db.prepare(`
      SELECT 
        t.created_at as "Date",
        t.product_name as "Product",
        t.quantity as "Quantity",
        t.original_price as "Original Price",
        t.sale_price as "Sale Price",
        t.discount_amount as "Discount",
        t.cost_price as "Cost Price",
        t.net_margin as "Net Margin",
        t.cashier_name as "Cashier",
        CASE WHEN t.is_combo = 1 THEN 'Yes' ELSE 'No' END as "Combo",
        t.combo_description as "Combo Description",
        t.notes as "Notes",
        CASE WHEN t.is_voided = 1 THEN 'Voided' ELSE 'Active' END as "Status"
      FROM transactions t
      WHERE t.stand_id = ?
      ORDER BY t.created_at DESC
    `).all(stand.id);
    
    const csv = Papa.unparse(transactions);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${stand.name}-transactions.csv"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

router.get('/events/:eventId/export/csv', authenticateToken, (req: Request, res: Response) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.eventId) as any;
    if (!event || event.organizer_id !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    const transactions = db.prepare(`
      SELECT 
        s.name as "Stand",
        t.created_at as "Date",
        t.product_name as "Product",
        t.quantity as "Quantity",
        t.sale_price as "Sale Price",
        t.cost_price as "Cost Price",
        t.net_margin as "Net Margin",
        t.cashier_name as "Cashier",
        CASE WHEN t.is_voided = 1 THEN 'Voided' ELSE 'Active' END as "Status"
      FROM transactions t
      JOIN stands s ON t.stand_id = s.id
      WHERE s.event_id = ?
      ORDER BY t.created_at DESC
    `).all(event.id);
    
    const csv = Papa.unparse(transactions);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${event.name}-all-transactions.csv"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

router.get('/stands/:standId/export/summary', authenticateToken, (req: Request, res: Response) => {
  try {
    const stand = db.prepare('SELECT * FROM stands WHERE id = ?').get(req.params.standId) as any;
    if (!stand || stand.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(stand.event_id) as any;
    const transactions = db.prepare('SELECT * FROM transactions WHERE stand_id = ?').all(stand.id) as any[];
    const stats = calculateStandStats(transactions, stand.stand_cost, stand.inventory_cost, event.commission_rate);
    
    res.json({
      stand: { id: stand.id, name: stand.name },
      event: { id: event.id, name: event.name, date: event.date },
      stats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
