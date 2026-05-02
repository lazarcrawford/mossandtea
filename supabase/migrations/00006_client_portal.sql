-- =============================================
-- Moss & Tea — Hermitage client portal foundation
-- =============================================
-- This migration replaces customer-facing RLS assumptions with the
-- customer_users access model. It intentionally drops legacy policies that
-- depended on customers.id = auth.uid().

-- ---------- Access model ----------
CREATE TABLE IF NOT EXISTS customer_users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'viewer')),
  invited_at   timestamptz DEFAULT now(),
  accepted_at  timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (customer_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_users_customer ON customer_users(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_users_user ON customer_users(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_users_active ON customer_users(user_id, customer_id) WHERE revoked_at IS NULL;

ALTER TABLE customer_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_customer_user(target_customer_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM customer_users cu
    WHERE cu.customer_id = target_customer_id
      AND cu.user_id = auth.uid()
      AND cu.revoked_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION can_access_project(target_project_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM projects p
    JOIN customer_users cu ON cu.customer_id = p.customer_id
    WHERE p.id = target_project_id
      AND cu.user_id = auth.uid()
      AND cu.revoked_at IS NULL
  );
$$;

-- ---------- Portal fields ----------
ALTER TABLE project_files
  ADD COLUMN IF NOT EXISTS is_client_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS download_allowed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS client_caption text;

CREATE INDEX IF NOT EXISTS idx_project_files_portal
  ON project_files(project_id, is_client_visible, sort_order, created_at);

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_client_visible boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS project_documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title           text NOT NULL,
  document_type   text DEFAULT 'document',
  status          text DEFAULT 'ready',
  file_url        text,
  r2_key          text,
  is_client_visible boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id);
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title           text NOT NULL DEFAULT 'Invoice',
  amount_cents    integer,
  status          text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'void', 'refunded')),
  due_date        date,
  payment_url     text,
  provider        text,
  is_client_visible boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS client_file_selections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_file_id uuid NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
  customer_id     uuid REFERENCES customers(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  selection_type  text NOT NULL DEFAULT 'favorite' CHECK (selection_type IN ('favorite', 'final_pick')),
  note            text,
  submitted_at    timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE (project_file_id, user_id, selection_type)
);

CREATE INDEX IF NOT EXISTS idx_client_file_selections_project ON client_file_selections(project_id);
CREATE INDEX IF NOT EXISTS idx_client_file_selections_user ON client_file_selections(user_id);
ALTER TABLE client_file_selections ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION set_client_selection_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_customer_id uuid;
  file_project_id uuid;
BEGIN
  SELECT customer_id INTO project_customer_id
  FROM projects
  WHERE id = NEW.project_id;

  IF project_customer_id IS NULL THEN
    RAISE EXCEPTION 'Project not found for selection';
  END IF;

  SELECT project_id INTO file_project_id
  FROM project_files
  WHERE id = NEW.project_file_id;

  IF file_project_id IS NULL OR file_project_id <> NEW.project_id THEN
    RAISE EXCEPTION 'Selected file does not belong to project';
  END IF;

  IF NOT is_admin() THEN
    NEW.user_id := auth.uid();
  END IF;

  NEW.customer_id := project_customer_id;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS client_file_selections_identity ON client_file_selections;
CREATE TRIGGER client_file_selections_identity
  BEFORE INSERT OR UPDATE ON client_file_selections
  FOR EACH ROW EXECUTE FUNCTION set_client_selection_identity();

-- ---------- Replace legacy policies ----------
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

DROP POLICY IF EXISTS "customer_users_admin_all" ON customer_users;
DROP POLICY IF EXISTS "customer_users_self_read" ON customer_users;
DROP POLICY IF EXISTS "customers_admin_all" ON customers;
DROP POLICY IF EXISTS "customers_portal_read" ON customers;
DROP POLICY IF EXISTS "projects_admin_all" ON projects;
DROP POLICY IF EXISTS "projects_portal_read" ON projects;
DROP POLICY IF EXISTS "project_files_admin_all" ON project_files;
DROP POLICY IF EXISTS "project_files_portal_read" ON project_files;
DROP POLICY IF EXISTS "contracts_admin_all" ON contracts;
DROP POLICY IF EXISTS "contracts_portal_read" ON contracts;
DROP POLICY IF EXISTS "payments_admin_all" ON payments;
DROP POLICY IF EXISTS "payments_portal_read" ON payments;
DROP POLICY IF EXISTS "messages_admin_all" ON messages;
DROP POLICY IF EXISTS "messages_portal_read" ON messages;
DROP POLICY IF EXISTS "project_documents_admin_all" ON project_documents;
DROP POLICY IF EXISTS "project_documents_portal_read" ON project_documents;
DROP POLICY IF EXISTS "invoices_admin_all" ON invoices;
DROP POLICY IF EXISTS "invoices_portal_read" ON invoices;
DROP POLICY IF EXISTS "client_file_selections_admin_all" ON client_file_selections;
DROP POLICY IF EXISTS "client_file_selections_portal_read" ON client_file_selections;
DROP POLICY IF EXISTS "client_file_selections_portal_insert" ON client_file_selections;
DROP POLICY IF EXISTS "client_file_selections_portal_update" ON client_file_selections;
DROP POLICY IF EXISTS "client_file_selections_portal_delete" ON client_file_selections;

CREATE POLICY "customer_users_admin_all" ON customer_users
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "customer_users_self_read" ON customer_users
  FOR SELECT USING (user_id = auth.uid() AND revoked_at IS NULL);

CREATE POLICY "customers_admin_all" ON customers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "customers_portal_read" ON customers
  FOR SELECT USING (is_customer_user(id));

CREATE POLICY "projects_admin_all" ON projects
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "projects_portal_read" ON projects
  FOR SELECT USING (can_access_project(id));

CREATE POLICY "project_files_admin_all" ON project_files
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "project_files_portal_read" ON project_files
  FOR SELECT USING (is_client_visible AND can_access_project(project_id));

CREATE POLICY "contracts_admin_all" ON contracts
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "contracts_portal_read" ON contracts
  FOR SELECT USING (can_access_project(project_id));

CREATE POLICY "payments_admin_all" ON payments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "payments_portal_read" ON payments
  FOR SELECT USING (can_access_project(project_id));

CREATE POLICY "messages_admin_all" ON messages
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "messages_portal_read" ON messages
  FOR SELECT USING (is_client_visible AND can_access_project(project_id));

CREATE POLICY "project_documents_admin_all" ON project_documents
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "project_documents_portal_read" ON project_documents
  FOR SELECT USING (is_client_visible AND can_access_project(project_id));

CREATE POLICY "invoices_admin_all" ON invoices
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "invoices_portal_read" ON invoices
  FOR SELECT USING (is_client_visible AND can_access_project(project_id));

CREATE POLICY "client_file_selections_admin_all" ON client_file_selections
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "client_file_selections_portal_read" ON client_file_selections
  FOR SELECT USING (user_id = auth.uid() AND can_access_project(project_id));

CREATE POLICY "client_file_selections_portal_insert" ON client_file_selections
  FOR INSERT WITH CHECK (user_id = auth.uid() AND can_access_project(project_id));

CREATE POLICY "client_file_selections_portal_update" ON client_file_selections
  FOR UPDATE USING (user_id = auth.uid() AND can_access_project(project_id))
  WITH CHECK (user_id = auth.uid() AND can_access_project(project_id));

CREATE POLICY "client_file_selections_portal_delete" ON client_file_selections
  FOR DELETE USING (user_id = auth.uid() AND can_access_project(project_id));

-- ---------- Private Storage replacement ----------
UPDATE storage.buckets
SET public = false
WHERE id = 'project-files';

DROP POLICY IF EXISTS "admin_upload" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_read" ON storage.objects;
DROP POLICY IF EXISTS "customer_read_own" ON storage.objects;
DROP POLICY IF EXISTS "admin_storage_read" ON storage.objects;
DROP POLICY IF EXISTS "admin_storage_upload" ON storage.objects;
DROP POLICY IF EXISTS "admin_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "admin_storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "customer_storage_read_own" ON storage.objects;
DROP POLICY IF EXISTS "customer_storage_read_visible_project_files" ON storage.objects;

CREATE POLICY "admin_storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-files' AND public.is_admin());

CREATE POLICY "admin_storage_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-files' AND public.is_admin());

CREATE POLICY "admin_storage_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'project-files' AND public.is_admin())
  WITH CHECK (bucket_id = 'project-files' AND public.is_admin());

CREATE POLICY "admin_storage_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-files' AND public.is_admin());

CREATE POLICY "customer_storage_read_visible_project_files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1
      FROM public.project_files pf
      WHERE pf.r2_key = storage.objects.name
        AND pf.is_client_visible = true
        AND public.can_access_project(pf.project_id)
    )
  );

-- ---------- Updated-at triggers ----------
DROP TRIGGER IF EXISTS customer_users_updated_at ON customer_users;
CREATE TRIGGER customer_users_updated_at BEFORE UPDATE ON customer_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS project_documents_updated_at ON project_documents;
CREATE TRIGGER project_documents_updated_at BEFORE UPDATE ON project_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS invoices_updated_at ON invoices;
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
