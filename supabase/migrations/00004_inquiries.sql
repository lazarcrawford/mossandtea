-- =============================================
-- Public inquiry capture
-- =============================================

CREATE TABLE IF NOT EXISTS inquiries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  subject     text,
  message     text NOT NULL,
  source      text DEFAULT 'website',
  status      text DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  user_agent  text,
  ip_hint     text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inquiries_admin_all" ON inquiries;
CREATE POLICY "inquiries_admin_all" ON inquiries
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- Public inserts should go through the Cloudflare Worker using a server-side
-- Supabase key. Do not grant anonymous direct insert access here.
