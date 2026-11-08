-- ============================================================
-- Vispute Restaurant – Initial Schema
-- Phase 1: Tables, RLS, Auth roles
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------
-- 1. TABLES (physical restaurant tables)
-- ----------------------------------------------------------------
CREATE TABLE tables (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number        INTEGER NOT NULL UNIQUE,
  secret_token  TEXT    NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 2. TABLE SESSIONS
-- ----------------------------------------------------------------
CREATE TABLE table_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id    UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'billed')),
  opened_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at   TIMESTAMPTZ
);

CREATE INDEX idx_sessions_table_status ON table_sessions(table_id, status);

-- ----------------------------------------------------------------
-- 3. CATEGORIES
-- ----------------------------------------------------------------
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_mr     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  icon        TEXT  -- emoji or icon name
);

-- ----------------------------------------------------------------
-- 4. MENU ITEMS
-- ----------------------------------------------------------------
CREATE TABLE menu_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name_mr         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  description_mr  TEXT,
  price           NUMERIC(8,2) NOT NULL CHECK (price >= 0),
  image_url       TEXT,
  is_veg          BOOLEAN NOT NULL DEFAULT TRUE,
  is_available    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_category ON menu_items(category_id);
CREATE INDEX idx_items_available ON menu_items(is_available);

-- ----------------------------------------------------------------
-- 5. ORDERS
-- ----------------------------------------------------------------
CREATE TABLE orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
  placed_by   TEXT NOT NULL DEFAULT 'customer'
                CHECK (placed_by IN ('customer', 'waiter')),
  status      TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'preparing', 'ready', 'served')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_orders_status  ON orders(status);

-- ----------------------------------------------------------------
-- 6. ORDER ITEMS
-- ----------------------------------------------------------------
CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id         UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  name_snapshot   TEXT NOT NULL,   -- Marathi name at time of order
  price_snapshot  NUMERIC(8,2) NOT NULL,
  qty             INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ----------------------------------------------------------------
-- 7. CUSTOMERS
-- ----------------------------------------------------------------
CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile          TEXT NOT NULL UNIQUE,
  name            TEXT,
  offers_consent  BOOLEAN NOT NULL DEFAULT FALSE,
  first_seen      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_visit      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_mobile ON customers(mobile);

-- ----------------------------------------------------------------
-- 8. BILLS
-- ----------------------------------------------------------------
CREATE TABLE bills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES table_sessions(id) ON DELETE RESTRICT,
  customer_id   UUID REFERENCES customers(id),
  subtotal      NUMERIC(10,2) NOT NULL,
  discount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  gst           NUMERIC(10,2) NOT NULL DEFAULT 0,
  total         NUMERIC(10,2) NOT NULL,
  payment_mode  TEXT NOT NULL DEFAULT 'cash'
                  CHECK (payment_mode IN ('cash', 'upi', 'card')),
  paid_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bills_session    ON bills(session_id);
CREATE INDEX idx_bills_paid_at    ON bills(paid_at);
CREATE INDEX idx_bills_customer   ON bills(customer_id);

-- ----------------------------------------------------------------
-- 9. STAFF (extends Supabase auth.users)
-- ----------------------------------------------------------------
CREATE TABLE staff (
  user_id  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role     TEXT NOT NULL
             CHECK (role IN ('admin', 'cashier', 'waiter', 'kitchen')),
  name     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 10. REALTIME – enable publications
-- ----------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE table_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;

-- ----------------------------------------------------------------
-- HELPER: get open session for a table
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_open_session(p_table_id UUID)
RETURNS UUID LANGUAGE SQL STABLE AS $$
  SELECT id FROM table_sessions
  WHERE table_id = p_table_id AND status = 'open'
  LIMIT 1;
$$;

-- ----------------------------------------------------------------
-- HELPER: get table_id from token (used in RLS)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION table_id_from_token(p_token TEXT)
RETURNS UUID LANGUAGE SQL STABLE AS $$
  SELECT id FROM tables WHERE secret_token = p_token LIMIT 1;
$$;
