import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';

const router = Router();

router.get('/stands/:standId/products', authenticateToken, (req: Request, res: Response) => {
  try {
    const stand = db.prepare('SELECT * FROM stands WHERE id = ?').get(req.params.standId) as any;
    if (!stand || stand.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    const products = db.prepare('SELECT * FROM products WHERE stand_id = ? AND is_active = 1 ORDER BY sort_order, created_at').all(stand.id);
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/stands/:standId/products',
  authenticateToken,
  [
    body('name').trim().isLength({ min: 1 }),
    body('price').isFloat({ min: 0 }),
    body('costPrice').isFloat({ min: 0 }),
    body('emoji').optional().isLength({ min: 1, max: 10 }),
    body('stock').optional().isInt({ min: 0 }),
    handleValidationErrors,
  ],
  (req: Request, res: Response) => {
    try {
      const stand = db.prepare('SELECT * FROM stands WHERE id = ?').get(req.params.standId) as any;
      if (!stand || stand.owner_id !== req.user!.id) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }
      
      const { name, price, costPrice, emoji = '🛍️', stock = 0 } = req.body;
      const id = uuidv4();
      
      const maxOrder = (db.prepare('SELECT MAX(sort_order) as max FROM products WHERE stand_id = ?').get(stand.id) as any)?.max || 0;
      
      db.prepare(`
        INSERT INTO products (id, stand_id, name, emoji, price, cost_price, stock, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, stand.id, name, emoji, price, costPrice, stock, maxOrder + 1);
      
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      res.status(201).json({ product });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

router.put('/products/reorder',
  authenticateToken,
  [
    body('productIds').isArray(),
    handleValidationErrors,
  ],
  (req: Request, res: Response) => {
    try {
      const { productIds } = req.body as { productIds: string[] };
      
      const updateStmt = db.prepare('UPDATE products SET sort_order = ? WHERE id = ?');
      const updateMany = db.transaction((ids: string[]) => {
        ids.forEach((id, index) => updateStmt.run(index, id));
      });
      updateMany(productIds);
      
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to reorder products' });
    }
  }
);

router.put('/products/:id',
  authenticateToken,
  [
    body('name').optional().trim().isLength({ min: 1 }),
    body('price').optional().isFloat({ min: 0 }),
    body('costPrice').optional().isFloat({ min: 0 }),
    body('emoji').optional().isLength({ min: 1, max: 10 }),
    body('stock').optional().isInt({ min: 0 }),
    handleValidationErrors,
  ],
  (req: Request, res: Response) => {
    try {
      const product = db.prepare('SELECT p.*, s.owner_id FROM products p JOIN stands s ON p.stand_id = s.id WHERE p.id = ?').get(req.params.id) as any;
      if (!product || product.owner_id !== req.user!.id) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }
      
      const { name, price, costPrice, emoji, stock } = req.body;
      
      db.prepare(`
        UPDATE products SET
          name = COALESCE(?, name),
          price = COALESCE(?, price),
          cost_price = COALESCE(?, cost_price),
          emoji = COALESCE(?, emoji),
          stock = COALESCE(?, stock)
        WHERE id = ?
      `).run(name || null, price ?? null, costPrice ?? null, emoji || null, stock ?? null, product.id);
      
      const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(product.id);
      res.json({ product: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

router.delete('/products/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const product = db.prepare('SELECT p.*, s.owner_id FROM products p JOIN stands s ON p.stand_id = s.id WHERE p.id = ?').get(req.params.id) as any;
    if (!product || product.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(product.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
