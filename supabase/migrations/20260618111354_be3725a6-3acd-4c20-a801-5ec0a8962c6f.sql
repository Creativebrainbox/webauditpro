
-- Add owner_user_id to leads so each admin only sees their own
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS owner_user_id uuid;

-- Backfill from audit_reports
UPDATE public.leads l
SET owner_user_id = r.owner_user_id
FROM public.audit_reports r
WHERE l.report_id = r.id AND l.owner_user_id IS NULL;

-- Replace SELECT policy: super owner sees all, admin sees own
DROP POLICY IF EXISTS "Admins can view leads" ON public.leads;
CREATE POLICY "Admins can view own leads, super owner all"
ON public.leads FOR SELECT TO authenticated
USING (
  public.is_super_owner(auth.uid())
  OR (public.has_role(auth.uid(), 'admin') AND owner_user_id = auth.uid())
);

-- Replace UPDATE policy similarly
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update own leads, super owner all"
ON public.leads FOR UPDATE TO authenticated
USING (
  public.is_super_owner(auth.uid())
  OR (public.has_role(auth.uid(), 'admin') AND owner_user_id = auth.uid())
)
WITH CHECK (
  public.is_super_owner(auth.uid())
  OR (public.has_role(auth.uid(), 'admin') AND owner_user_id = auth.uid())
);
