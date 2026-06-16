DROP POLICY IF EXISTS "Authenticated can mark issues resolved" ON public.audit_reports;
CREATE POLICY "Admins can mark issues resolved"
  ON public.audit_reports
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));