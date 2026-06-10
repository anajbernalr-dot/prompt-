import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'popup-analytics-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().isLength({ min: 1 }),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }
      
      const id = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);
      
      db.prepare(`
        INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)
      `).run(id, email, name, passwordHash);
      
      const token = jwt.sign({ id, email, name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      
      res.status(201).json({ token, user: { id, email, name } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

router.get('/me', authenticateToken, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;
