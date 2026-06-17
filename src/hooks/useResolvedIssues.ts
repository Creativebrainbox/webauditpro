import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SUPER_OWNER_EMAIL = 'thecreativebrainbox@gmail.com';

export function useResolvedIssues(reportId: string | undefined) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [canResolve, setCanResolve] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!reportId) return;
      setLoading(true);

      const { data: row } = await (supabase as any)
        .from('audit_reports')
        .select('resolved_issue_ids, owner_user_id')
        .eq('id', reportId)
        .maybeSingle();

      if (!cancelled && row?.resolved_issue_ids) {
        setResolved(new Set<string>(row.resolved_issue_ids as string[]));
      }

      const { data: auth } = await supabase.auth.getUser();
      if (!cancelled && auth?.user) {
        const isSuperOwner = (auth.user.email || '').toLowerCase() === SUPER_OWNER_EMAIL;
        const isReportOwner = !!row?.owner_user_id && row.owner_user_id === auth.user.id;
        setCanResolve(isSuperOwner || isReportOwner);
      }

      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [reportId]);

  const toggle = useCallback(async (issueId: string) => {
    if (!reportId || !canResolve) return;
    const next = new Set(resolved);
    if (next.has(issueId)) next.delete(issueId); else next.add(issueId);
    setResolved(next);
    const { error } = await (supabase as any)
      .from('audit_reports')
      .update({ resolved_issue_ids: Array.from(next) })
      .eq('id', reportId);
    if (error) {
      setResolved(resolved);
      console.error('Failed to update resolved issues', error);
    }
  }, [reportId, canResolve, resolved]);

  return { resolved, canResolve, loading, toggle };
}
