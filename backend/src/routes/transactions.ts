import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';

const router = Router();

router.post('/',
  authenticateToken,
  [
    body('standId').isString().notEmpty(),
    body('productName').isString().notEmpty(),
    body('quantity').isInt({ min: 1 }),
    body('originalPrice').isFloat({ min: 0 }),
    body('salePrice').isFloat({ min: 0 }),
    body('costPrice').isFloat({ min: 0 }),
    handleValidationErrors,
  ],
  (req: Request, res: Response) => {
    try {
      const {
        standId, productId, productName, quantity, originalPrice,
        salePrice, costPrice, cashierId, cashierName, isCombo,
        comboDescription, notes, discountAmount = 0
      } = req.body;
      
      const stand = db.prepare('SELECT * FROM stands WHERE id = ?').get(standId) as any;
      if (!stand) {
        res.status(404).json({ error: 'Stand not found' });
        return;
      }
      
      const id = uuidv4();
      const netMargin = salePrice - costPrice;
      
      db.prepare(`
        INSERT INTO transactions (
          id, stand_id, product_id, product_name, quantity, original_price, sale_price,
          discount_amount, cost_price, net_margin, cashier_id, cashier_name, is_combo,
          combo_description, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, standId, productId || null, productName, quantity, originalPrice, salePrice,
        discountAmount, costPrice, netMargin, cashierId || null, cashierName || null,
        isCombo ? 1 : 0, comboDescription || null, notes || null
      );
      
      if (productId) {
        db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?').run(quantity, productId);
      }
      
      const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
      res.status(201).json({ transaction });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to record transaction' });
    }
  }
);

router.get('/stands/:standId/transactions', authenticateToken, (req: Request, res: Response) => {
  try {
    const stand = db.prepare('SELECT * FROM stands WHERE id = ?').get(req.params.standId) as any;
    if (!stand || stand.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const transactions = db.prepare(`
      SELECT * FROM transactions WHERE stand_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(stand.id, limit, offset);
    
    const total = (db.prepare('SELECT COUNT(*) as count FROM transactions WHERE stand_id = ?').get(stand.id) as any).count;
    
    res.json({ transactions, total, limit, offset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.delete('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const transaction = db.prepare(`
      SELECT t.*, s.owner_id FROM transactions t JOIN stands s ON t.stand_id = s.id WHERE t.id = ?
    `).get(req.params.id) as any;
    
    if (!transaction || transaction.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    if (transaction.product_id && !transaction.is_voided) {
      db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(transaction.quantity, transaction.product_id);
    }
    
    db.prepare('UPDATE transactions SET is_voided = 1 WHERE id = ?').run(transaction.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to void transaction' });
  }
});

export default router;
