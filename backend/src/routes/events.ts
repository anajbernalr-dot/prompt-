import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';
import { generateUniqueAccessCode } from '../utils/codeGenerator';
import { calculateStandStats } from '../utils/calculations';

const router = Router();

router.post('/',
  authenticateToken,
  [
    body('name').trim().isLength({ min: 1 }),
    body('location').trim().isLength({ min: 1 }),
    body('date').isISO8601(),
    body('commissionRate').optional().isFloat({ min: 0, max: 1 }),
    body('maxStands').optional().isInt({ min: 1 }),
    body('planType').optional().isIn(['starter', 'pro', 'enterprise']),
    handleValidationErrors,
  ],
  (req: Request, res: Response) => {
    try {
      const { name, location, date, commissionRate = 0.20, maxStands = 30, planType = 'starter' } = req.body;
      const id = uuidv4();
      const accessCode = generateUniqueAccessCode();
      
      db.prepare(`
        INSERT INTO events (id, name, location, date, access_code, commission_rate, organizer_id, max_stands, plan_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, name, location, date, accessCode, commissionRate, req.user!.id, maxStands, planType);
      
      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
      res.status(201).json({ event });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
);

router.get('/my', authenticateToken, (req: Request, res: Response) => {
  try {
    const events = db.prepare(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM stands WHERE event_id = e.id) as stand_count
      FROM events e
      WHERE e.organizer_id = ?
      ORDER BY e.created_at DESC
    `).all(req.user!.id);
    
    res.json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/join',
  authenticateToken,
  [
    body('accessCode').trim().isLength({ min: 1 }),
    body('standName').trim().isLength({ min: 1 }),
    body('standCost').optional().isFloat({ min: 0 }),
    body('inventoryCost').optional().isFloat({ min: 0 }),
    handleValidationErrors,
  ],
  (req: Request, res: Response) => {
    try {
      const { accessCode, standName, standCost = 0, inventoryCost = 0 } = req.body;
      
      const event = db.prepare('SELECT * FROM events WHERE access_code = ?').get(accessCode) as any;
      if (!event) {
        res.status(404).json({ error: 'Event not found with this access code' });
        return;
      }
      
      if (event.status !== 'active') {
        res.status(400).json({ error: 'This event is no longer active' });
        return;
      }
      
      const standCount = (db.prepare('SELECT COUNT(*) as count FROM stands WHERE event_id = ?').get(event.id) as any).count;
      if (standCount >= event.max_stands) {
        res.status(400).json({ error: 'Event is at maximum capacity' });
        return;
      }
      
      const existingStand = db.prepare('SELECT id FROM stands WHERE event_id = ? AND owner_id = ?').get(event.id, req.user!.id);
      if (existingStand) {
        res.status(409).json({ error: 'You already have a stand in this event', stand: existingStand });
        return;
      }
      
      const standId = uuidv4();
      db.prepare(`
        INSERT INTO stands (id, event_id, owner_id, name, stand_cost, inventory_cost)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(standId, event.id, req.user!.id, standName, standCost, inventoryCost);
      
      const stand = db.prepare('SELECT * FROM stands WHERE id = ?').get(standId);
      res.status(201).json({ event, stand });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to join event' });
    }
  }
);

router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json({ event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

router.get('/:id/dashboard', authenticateToken, (req: Request, res: Response) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id) as any;
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    if (event.organizer_id !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    const stands = db.prepare('SELECT * FROM stands WHERE event_id = ?').all(event.id) as any[];
    
    const standsWithStats = stands.map(stand => {
      const transactions = db.prepare('SELECT * FROM transactions WHERE stand_id = ?').all(stand.id) as any[];
      const stats = calculateStandStats(transactions, stand.stand_cost, stand.inventory_cost, event.commission_rate);
      return { ...stand, stats };
    });
    
    const totalRevenue = standsWithStats.reduce((sum, s) => sum + s.stats.totalRevenue, 0);
    const totalCommission = totalRevenue * event.commission_rate;
    const totalTransactions = standsWithStats.reduce((sum, s) => sum + s.stats.totalTransactions, 0);
    
    res.json({
      event,
      stands: standsWithStats,
      summary: {
        totalRevenue,
        totalCommission,
        totalTransactions,
        standCount: stands.length,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;
