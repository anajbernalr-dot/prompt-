CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  access_code TEXT UNIQUE NOT NULL,
  commission_rate REAL NOT NULL DEFAULT 0.20,
  organizer_id TEXT NOT NULL,
  max_stands INTEGER NOT NULL DEFAULT 30,
  plan_type TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS stands (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  stand_cost REAL NOT NULL DEFAULT 0,
  inventory_cost REAL NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS cashiers (
  id TEXT PRIMARY KEY,
  stand_id TEXT NOT NULL,
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stand_id) REFERENCES stands(id)
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  stand_id TEXT NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🛍️',
  price REAL NOT NULL,
  cost_price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stand_id) REFERENCES stands(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  stand_id TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  original_price REAL NOT NULL,
  sale_price REAL NOT NULL,
  discount_amount REAL NOT NULL DEFAULT 0,
  cost_price REAL NOT NULL,
  net_margin REAL NOT NULL,
  cashier_id TEXT,
  cashier_name TEXT,
  is_combo INTEGER NOT NULL DEFAULT 0,
  combo_description TEXT,
  notes TEXT,
  is_voided INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stand_id) REFERENCES stands(id)
);
