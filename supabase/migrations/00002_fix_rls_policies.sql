-- =============================================
-- Fix RLS policies to use admins table instead of JWT role
-- The JWT role is always 'authenticated' for logged-in users,
-- so auth.jwt() ->> 'role' = 'admin' never evaluates to true.
-- Instead, check if auth.uid() exists in the admins table
-- or if auth.jwt() ->> 'email' matches an admin.
-- =============================================

-- Drop existing broken policies
DROP POLICY IF EXISTS "admins_full_access" ON customers;
DROP POLICY IF EXISTS "customers_self" ON customers;
DROP POLICY IF EXISTS "projects_customer_own" ON projects;
DROP POLICY IF EXISTS "projects_admin_all" ON projects;
DROP POLICY IF EXISTS "files_customer_read" ON project_files;
DROP POLICY IF EXISTS "files_admin_all" ON project_files;
DROP POLICY IF EXISTS "contracts_customer_read" ON contracts;
DROP POLICY IF EXISTS "contracts_admin_all" ON contracts;
DROP POLICY IF EXISTS "payments_customer_read" ON payments;
DROP POLICY IF EXISTS "payments_admin_all" ON payments;
DROP POLICY IF EXISTS "messages_project_access" ON messages;
DROP POLICY IF EXISTS "messages_admin_insert" ON messages;
DROP POLICY IF EXISTS "messages_customer_insert" ON messages;

-- Helper: admin check via admins table
-- Admins can do everything
-- Customers can read/write their own data

-- Customers table
CREATE POLICY "admins_full_access" ON customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email')
  );
CREATE POLICY "customers_self" ON customers
  FOR ALL USING (auth.uid() = id);

-- Projects
CREATE POLICY "projects_customer_own" ON projects
  FOR SELECT USING (
    customer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email')
  );
CREATE POLICY "projects_admin_all" ON projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email')
  );

-- Project files
CREATE POLICY "files_customer_read" ON project_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.customer_id = auth.uid()
    ) OR EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email')
  );
CREATE POLICY "files_admin_all" ON project_files
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email')
  );

-- Contracts
CREATE POLICY "contracts_customer_read" ON contracts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = contracts.project_id
      AND projects.customer_id = auth.uid()
    ) OR EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email')
  );
CREATE POLICY "contracts_admin_all" ON contracts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email')
  );

-- Payments
CREATE POLICY "payments_customer_read" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = payments.project_id
      AND projects.customer_id = auth.uid()
    ) OR EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email')
  );
CREATE POLICY "payments_admin_all" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email')
  );

-- Messages
CREATE POLICY "messages_project_access" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND (projects.customer_id = auth.uid() OR
           EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email'))
    )
  );
CREATE POLICY "messages_admin_insert" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email')
  );
CREATE POLICY "messages_customer_insert" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND projects.customer_id = auth.uid()
    )
  );

-- Also enable RLS on admins table and allow admins to read it
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_own" ON admins
  FOR SELECT USING (admins.email = auth.jwt() ->> 'email');

-- Enable storage access for admins
-- (project-files bucket)