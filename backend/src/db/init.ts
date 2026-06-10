import { initializeDatabase } from './database';
import db from './database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function seed() {
  initializeDatabase();

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@popup.com');
  if (existingUser) {
    console.log('Database already seeded.');
    return;
  }

  const userId = uuidv4();
  const passwordHash = await bcrypt.hash('demo1234', 10);
  
  db.prepare(`
    INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)
  `).run(userId, 'demo@popup.com', 'Demo User', passwordHash);

  console.log('Seeded demo user: demo@popup.com / demo1234');
  console.log('Database initialization complete.');
}

seed().catch(console.error);
