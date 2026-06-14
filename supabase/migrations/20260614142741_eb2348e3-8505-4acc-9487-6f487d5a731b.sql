
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TYPE public.user_type AS ENUM ('store_owner', 'agency');
CREATE TYPE public.opportunity_level AS ENUM ('healthy', 'moderate', 'high', 'critical');

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  company_name TEXT,
  store_url TEXT NOT NULL,
  user_type user_type NOT NULL,
  agency_name TEXT,
  agency_website TEXT,
  agency_logo_url TEXT,
  audit_score INTEGER,
  opportunity_level opportunity_level,
  report_id UUID,
  pdf_url TEXT,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  delivery_status TEXT,
  telegram_sent BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT
);

GRANT INSERT ON public.leads TO anon, authenticated;
GRANT SELECT, UPDATE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit leads"
  ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view leads"
  ON public.leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_user_type ON public.leads(user_type);
CREATE INDEX idx_leads_opportunity ON public.leads(opportunity_level);

CREATE POLICY "Anyone can upload agency logos"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'agency-logos');

CREATE POLICY "Public can view agency logos"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'agency-logos');
