-- =============================================
-- Private project file storage
-- =============================================

-- Existing application code previously used public project-files URLs.
-- Keep the bucket private and rely on authenticated signed URLs.
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

CREATE POLICY "admin_storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-files' AND is_admin());

CREATE POLICY "admin_storage_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-files' AND is_admin());

CREATE POLICY "admin_storage_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'project-files' AND is_admin())
  WITH CHECK (bucket_id = 'project-files' AND is_admin());

CREATE POLICY "admin_storage_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-files' AND is_admin());

CREATE POLICY "customer_storage_read_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1
      FROM project_files pf
      JOIN projects pr ON pr.id = pf.project_id
      WHERE pf.r2_key = storage.objects.name
      AND pr.customer_id = auth.uid()
    )
  );
