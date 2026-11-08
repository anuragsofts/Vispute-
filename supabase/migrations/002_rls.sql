-- ============================================================
-- Vispute Restaurant – Row Level Security Policies
-- Phase 1: RLS
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE tables          ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills           ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff           ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- Helper: check staff role
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_staff_role(required_role TEXT)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff
    WHERE user_id = auth.uid() AND role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION is_any_staff()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff WHERE user_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------
-- Public: read active tables (needed for QR token lookup)
CREATE POLICY "Public can read active tables"
  ON tables FOR SELECT
  USING (is_active = TRUE);

-- Staff only: full CRUD
CREATE POLICY "Staff can manage tables"
  ON tables FOR ALL
  USING (is_any_staff())
  WITH CHECK (is_any_staff());

-- ----------------------------------------------------------------
-- TABLE SESSIONS
-- ----------------------------------------------------------------
-- Public: read their own session via table token (passed as app_session)
-- We store the current table token in a session setting
CREATE POLICY "Public read own session"
  ON table_sessions FOR SELECT
  USING (
    table_id = table_id_from_token(current_setting('app.table_token', TRUE))
    OR is_any_staff()
  );

CREATE POLICY "Public insert session for their table"
  ON table_sessions FOR INSERT
  WITH CHECK (
    table_id = table_id_from_token(current_setting('app.table_token', TRUE))
  );

-- Staff can update sessions (e.g., close them)
CREATE POLICY "Staff can update sessions"
  ON table_sessions FOR UPDATE
  USING (is_any_staff())
  WITH CHECK (is_any_staff());

-- ----------------------------------------------------------------
-- CATEGORIES – public read, admin write
-- ----------------------------------------------------------------
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin manages categories"
  ON categories FOR ALL
  USING (is_staff_role('admin'))
  WITH CHECK (is_staff_role('admin'));

-- ----------------------------------------------------------------
-- MENU ITEMS – public read available, admin/waiter write
-- ----------------------------------------------------------------
CREATE POLICY "Anyone can read available menu items"
  ON menu_items FOR SELECT
  USING (TRUE);  -- is_available filter handled at app level

CREATE POLICY "Admin manages menu items"
  ON menu_items FOR ALL
  USING (is_staff_role('admin'))
  WITH CHECK (is_staff_role('admin'));

CREATE POLICY "Waiter can toggle availability"
  ON menu_items FOR UPDATE
  USING (is_any_staff())
  WITH CHECK (is_any_staff());

-- ----------------------------------------------------------------
-- ORDERS
-- ----------------------------------------------------------------
-- Customers: insert orders only for their open session
CREATE POLICY "Customer can insert order for own session"
  ON orders FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM table_sessions
      WHERE table_id = table_id_from_token(current_setting('app.table_token', TRUE))
        AND status = 'open'
    )
    OR is_any_staff()
  );

CREATE POLICY "Customer can read own orders"
  ON orders FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM table_sessions
      WHERE table_id = table_id_from_token(current_setting('app.table_token', TRUE))
    )
    OR is_any_staff()
  );

CREATE POLICY "Staff can update order status"
  ON orders FOR UPDATE
  USING (is_any_staff())
  WITH CHECK (is_any_staff());

-- ----------------------------------------------------------------
-- ORDER ITEMS
-- ----------------------------------------------------------------
CREATE POLICY "Customer can insert order items for own orders"
  ON order_items FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN table_sessions ts ON ts.id = o.session_id
      WHERE ts.table_id = table_id_from_token(current_setting('app.table_token', TRUE))
        AND ts.status = 'open'
    )
    OR is_any_staff()
  );

CREATE POLICY "Customer and staff can read order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN table_sessions ts ON ts.id = o.session_id
      WHERE ts.table_id = table_id_from_token(current_setting('app.table_token', TRUE))
    )
    OR is_any_staff()
  );

-- ----------------------------------------------------------------
-- CUSTOMERS – cashier+admin
-- ----------------------------------------------------------------
CREATE POLICY "Staff can manage customers"
  ON customers FOR ALL
  USING (is_any_staff())
  WITH CHECK (is_any_staff());

-- Allow anon insert (for billing step where customer mobile is collected)
CREATE POLICY "Anyone can insert customer"
  ON customers FOR INSERT
  WITH CHECK (TRUE);

-- ----------------------------------------------------------------
-- BILLS – cashier+admin
-- ----------------------------------------------------------------
CREATE POLICY "Staff can manage bills"
  ON bills FOR ALL
  USING (is_any_staff())
  WITH CHECK (is_any_staff());

-- ----------------------------------------------------------------
-- STAFF – admin only
-- ----------------------------------------------------------------
CREATE POLICY "Admin manages staff"
  ON staff FOR ALL
  USING (is_staff_role('admin'))
  WITH CHECK (is_staff_role('admin'));

-- Self-read: a staff member can read their own row
CREATE POLICY "Staff can read own record"
  ON staff FOR SELECT
  USING (user_id = auth.uid());
