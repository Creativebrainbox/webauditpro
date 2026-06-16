ALTER TABLE public.audit_reports ADD COLUMN IF NOT EXISTS resolved_issue_ids text[] NOT NULL DEFAULT '{}';
GRANT UPDATE (resolved_issue_ids) ON public.audit_reports TO authenticated;
DROP POLICY IF EXISTS "Authenticated can mark issues resolved" ON public.audit_reports;
CREATE POLICY "Authenticated can mark issues resolved"
  ON public.audit_reports
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);