-- =============================================
-- Fix RLS policies to use is_admin() SECURITY DEFINER function
-- Original policies checked auth.jwt() ->> 'role' = 'admin' which never
-- evaluates to true since Supabase JWTs always have role = 'authenticated'.
-- =============================================

-- Disable RLS on admins table (lookup table needed for policy checks)
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Helper function: checks if current user's email is in the admins table
-- SECURITY DEFINER runs with table owner privileges, bypassing RLS on admins
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email');
$$;

-- Customers
CREATE POLICY "admins_full_access" ON customers FOR ALL USING (is_admin());
CREATE POLICY "customers_self" ON customers FOR ALL USING (auth.uid() = id);

-- Projects
CREATE POLICY "projects_customer_own" ON projects FOR SELECT USING (customer_id = auth.uid() OR is_admin());
CREATE POLICY "projects_admin_all" ON projects FOR ALL USING (is_admin());

-- Project files
CREATE POLICY "files_customer_read" ON project_files FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = project_files.project_id AND projects.customer_id = auth.uid()) OR is_admin()
);
CREATE POLICY "files_admin_all" ON project_files FOR ALL USING (is_admin());

-- Contracts
CREATE POLICY "contracts_customer_read" ON contracts FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = contracts.project_id AND projects.customer_id = auth.uid()) OR is_admin()
);
CREATE POLICY "contracts_admin_all" ON contracts FOR ALL USING (is_admin());

-- Payments
CREATE POLICY "payments_customer_read" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = payments.project_id AND projects.customer_id = auth.uid()) OR is_admin()
);
CREATE POLICY "payments_admin_all" ON payments FOR ALL USING (is_admin());

-- Messages
CREATE POLICY "messages_project_access" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = messages.project_id AND (projects.customer_id = auth.uid() OR is_admin()))
);
CREATE POLICY "messages_admin_insert" ON messages FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "messages_customer_insert" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = messages.project_id AND projects.customer_id = auth.uid())
);

-- Storage policies (project-files bucket)
CREATE POLICY "admin_upload" ON storage.objects FOR INSERT WITH CHECK (is_admin() AND bucket_id = 'project-files');
CREATE POLICY "admin_delete" ON storage.objects FOR DELETE USING (is_admin() AND bucket_id = 'project-files');
CREATE POLICY "authenticated_read" ON storage.objects FOR SELECT USING (bucket_id = 'project-files');