
-- Application status enum
DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- agency_applications table
CREATE TABLE IF NOT EXISTS public.agency_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  agency_name text NOT NULL,
  agency_website text,
  agency_logo_url text,
  application_status public.application_status NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  rejection_reason text
);

GRANT SELECT, INSERT, UPDATE ON public.agency_applications TO authenticated;
GRANT INSERT ON public.agency_applications TO anon;
GRANT ALL ON public.agency_applications TO service_role;

ALTER TABLE public.agency_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit an application" ON public.agency_applications;
CREATE POLICY "Anyone can submit an application"
  ON public.agency_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Applicant or super owner can view" ON public.agency_applications;
CREATE POLICY "Applicant or super owner can view"
  ON public.agency_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_super_owner(auth.uid()));

DROP POLICY IF EXISTS "Super owner can update applications" ON public.agency_applications;
CREATE POLICY "Super owner can update applications"
  ON public.agency_applications FOR UPDATE
  TO authenticated
  USING (public.is_super_owner(auth.uid()))
  WITH CHECK (public.is_super_owner(auth.uid()));

-- Helper: is_approved_agency
CREATE OR REPLACE FUNCTION public.is_approved_agency(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'agency_admin'
  );
$$;

-- Bootstrap trigger — super owner => owner_admin, everyone else => store_owner
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'thecreativebrainbox@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'store_owner')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Backfill super owner role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner_admin'::public.app_role FROM auth.users
WHERE lower(email) = 'thecreativebrainbox@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
