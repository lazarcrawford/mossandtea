-- =============================================
-- Moss & Tea — CRM & Project Management Schema
-- =============================================

-- Customers (also serves as auth users via Supabase Auth)
CREATE TABLE customers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  phone         text,
  instagram     text,
  address       text,
  notes         text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Admin users (Irina & team)
CREATE TABLE admins (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  name          text NOT NULL,
  role          text DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at    timestamptz DEFAULT now()
);

-- Projects
CREATE TYPE project_status AS ENUM ('inquiry', 'booked', 'shoot_complete', 'editing', 'delivered', 'archived');

CREATE TABLE projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid REFERENCES customers(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  status          project_status DEFAULT 'inquiry',
  shoot_date      date,
  delivery_date   date,
  location        text,
  price_cents     integer, -- in cents to avoid float issues
  deposit_cents   integer,
  deposit_paid    boolean DEFAULT false,
  balance_paid    boolean DEFAULT false,
  contract_url    text,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Project files (photos delivered to customer)
CREATE TABLE project_files (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id) ON DELETE CASCADE,
  filename        text NOT NULL,
  original_name   text NOT NULL,
  mime_type       text,
  file_size       bigint,
  r2_key          text NOT NULL, -- Cloudflare R2 object key
  uploaded_by     text DEFAULT 'admin', -- 'admin' or 'customer'
  created_at      timestamptz DEFAULT now()
);

-- Contracts (PDFs stored in R2, metadata here)
CREATE TABLE contracts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id) ON DELETE CASCADE,
  title           text NOT NULL,
  r2_key          text NOT NULL,
  signed_by_customer boolean DEFAULT false,
  signed_at       timestamptz,
  signed_by_admin boolean DEFAULT false,
  admin_signed_at timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- Payments
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'bank_transfer', 'venmo', 'zelle', 'paypal', 'other');

CREATE TABLE payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id) ON DELETE CASCADE,
  amount_cents    integer NOT NULL,
  method          payment_method,
  notes           text,
  paid_at         timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

-- Messages / communications log
CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id) ON DELETE CASCADE,
  sender          text NOT NULL CHECK (sender IN ('admin', 'customer')),
  body            text NOT NULL,
  created_at      timestamptz DEFAULT now()
);

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX idx_projects_customer ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_files_project ON project_files(project_id);
CREATE INDEX idx_payments_project ON payments(project_id);
CREATE INDEX idx_contracts_project ON contracts(project_id);
CREATE INDEX idx_messages_project ON messages(project_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own data
CREATE POLICY "customers_self" ON customers
  FOR ALL USING (auth.uid() = id);

-- Admins can see everything
CREATE POLICY "admins_full_access" ON customers
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Similar policies for projects
CREATE POLICY "projects_customer_own" ON projects
  FOR SELECT USING (
    customer_id = auth.uid() OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "projects_admin_all" ON projects
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Files: customers can read own project files, admins can CRUD
CREATE POLICY "files_customer_read" ON project_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.customer_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "files_admin_all" ON project_files
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Contracts: read only for customers of the project
CREATE POLICY "contracts_customer_read" ON contracts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = contracts.project_id
      AND projects.customer_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "contracts_admin_all" ON contracts
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Payments: customers can see their own, admins can CRUD
CREATE POLICY "payments_customer_read" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = payments.project_id
      AND projects.customer_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "payments_admin_all" ON payments
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Messages
CREATE POLICY "messages_project_access" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND (projects.customer_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    )
  );

CREATE POLICY "messages_admin_insert" ON messages
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "messages_customer_insert" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND projects.customer_id = auth.uid()
    )
  );

-- =============================================
-- Helper functions
-- =============================================

-- Get project with customer info (for admin views)
CREATE OR REPLACE VIEW project_details AS
SELECT
  p.*,
  c.first_name || ' ' || c.last_name AS customer_name,
  c.email AS customer_email,
  c.phone AS customer_phone,
  (SELECT COUNT(*) FROM project_files pf WHERE pf.project_id = p.id) AS file_count,
  (SELECT COALESCE(SUM(amount_cents), 0) FROM payments pm WHERE pm.project_id = p.id) AS total_paid_cents
FROM projects p
JOIN customers c ON c.id = p.customer_id;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
