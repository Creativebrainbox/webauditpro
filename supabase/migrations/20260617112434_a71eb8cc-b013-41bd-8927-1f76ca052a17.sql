
-- Add owner to audit_reports
ALTER TABLE public.audit_reports ADD COLUMN IF NOT EXISTS owner_user_id uuid;

-- Super-owner helper: checks email of the auth user
CREATE OR REPLACE FUNCTION public.is_super_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id
      AND lower(email) = 'thecreativebrainbox@gmail.com'
  )
$$;

-- Replace the existing update policy so only the report's owner admin OR the super owner can mark resolved
DROP POLICY IF EXISTS "Admins can mark issues resolved" ON public.audit_reports;

CREATE POLICY "Report owner or super owner can update resolved issues"
ON public.audit_reports
FOR UPDATE
TO authenticated
USING (
  public.is_super_owner(auth.uid())
  OR (owner_user_id IS NOT NULL AND owner_user_id = auth.uid())
)
WITH CHECK (
  public.is_super_owner(auth.uid())
  OR (owner_user_id IS NOT NULL AND owner_user_id = auth.uid())
);

-- Backfill ownership: assign all existing reports to the super-owner if they exist
UPDATE public.audit_reports
SET owner_user_id = u.id
FROM auth.users u
WHERE public.audit_reports.owner_user_id IS NULL
  AND lower(u.email) = 'thecreativebrainbox@gmail.com';
