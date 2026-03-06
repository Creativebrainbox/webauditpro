CREATE TABLE public.audit_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  domain text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reports" ON public.audit_reports
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert reports" ON public.audit_reports
  FOR INSERT WITH CHECK (true);