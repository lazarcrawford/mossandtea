-- =============================================
-- Storage RLS Policies for project-files bucket
-- =============================================

-- Admins can upload/delete any file
CREATE POLICY "admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
    AND bucket_id = 'project-files'
  );

CREATE POLICY "admin_delete" ON storage.objects
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
    AND bucket_id = 'project-files'
  );

-- Anyone authenticated can read public files
CREATE POLICY "authenticated_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-files'
  );

-- Customers can read files for their own projects
CREATE POLICY "customer_read_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1 FROM project_files pf
      JOIN projects pr ON pf.project_id = pr.id
      WHERE pf.r2_key = storage.objects.name
      AND pr.customer_id = auth.uid()
    )
  );
