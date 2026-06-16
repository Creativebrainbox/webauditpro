import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useResolvedIssues(reportId: string | undefined) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!reportId) return;
      setLoading(true);
      const { data: row } = await (supabase as any)
        .from('audit_reports')
        .select('resolved_issue_ids')
        .eq('id', reportId)
        .maybeSingle();
      if (!cancelled && row?.resolved_issue_ids) {
        setResolved(new Set<string>(row.resolved_issue_ids as string[]));
      }
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) {
        const { data: roleRow } = await (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', auth.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        if (!cancelled) setIsAdmin(!!roleRow);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [reportId]);

  const toggle = useCallback(async (issueId: string) => {
    if (!reportId || !isAdmin) return;
    const next = new Set(resolved);
    if (next.has(issueId)) next.delete(issueId); else next.add(issueId);
    setResolved(next);
    const { error } = await (supabase as any)
      .from('audit_reports')
      .update({ resolved_issue_ids: Array.from(next) })
      .eq('id', reportId);
    if (error) {
      // rollback on failure
      setResolved(resolved);
      console.error('Failed to update resolved issues', error);
    }
  }, [reportId, isAdmin, resolved]);

  return { resolved, isAdmin, loading, toggle };
}
