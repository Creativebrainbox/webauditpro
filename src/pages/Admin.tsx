import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Users, TrendingUp, AlertCircle, Briefcase, Store, BarChart3, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


interface Lead {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  whatsapp: string | null;
  company_name: string | null;
  store_url: string;
  user_type: 'store_owner' | 'agency';
  agency_name: string | null;
  audit_score: number | null;
  opportunity_level: 'healthy' | 'moderate' | 'high' | 'critical' | null;
  email_sent: boolean;
  telegram_sent: boolean;
  report_id: string | null;
}

const opportunityColors: Record<string, string> = {
  healthy: 'bg-success/15 text-success border-success/30',
  moderate: 'bg-info/15 text-info border-info/30',
  high: 'bg-warning/15 text-warning border-warning/30',
  critical: 'bg-destructive/15 text-destructive border-destructive/30',
};

const SUPER_OWNER_EMAIL = 'thecreativebrainbox@gmail.com';

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'all' | 'store_owner' | 'agency' | 'critical' | 'high'>('all');
  const [isSuperOwner, setIsSuperOwner] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { navigate('/auth'); return; }
      const uid = sessionData.session.user.id;
      const email = (sessionData.session.user.email || '').toLowerCase();
      const superOwner = email === SUPER_OWNER_EMAIL;
      setIsSuperOwner(superOwner);
      const { data: roleRow } = await supabase.from('user_roles').select('role').eq('user_id', uid).eq('role', 'admin').maybeSingle();
      if (!roleRow) {
        toast({ title: 'Access denied', description: 'Your account is not an admin.', variant: 'destructive' });
        await supabase.auth.signOut();
        navigate('/auth');
        return;
      }
      setAuthorized(true);
      // RLS scopes results: super owner sees all, other admins see only their own leads
      const { data: leadRows, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) toast({ title: 'Load failed', description: error.message, variant: 'destructive' });
      else setLeads(leadRows as Lead[]);
      setLoading(false);
    })();
  }, [navigate, toast]);


  const signOut = async () => { await supabase.auth.signOut(); navigate('/auth'); };

  const now = Date.now();
  const day = 86_400_000;
  const filtered = leads.filter((l) => {
    if (filter === 'store_owner') return l.user_type === 'store_owner';
    if (filter === 'agency') return l.user_type === 'agency';
    if (filter === 'critical') return l.opportunity_level === 'critical';
    if (filter === 'high') return l.opportunity_level === 'high';
    return true;
  });

  const stats = {
    total: leads.length,
    daily: leads.filter((l) => now - new Date(l.created_at).getTime() < day).length,
    weekly: leads.filter((l) => now - new Date(l.created_at).getTime() < 7 * day).length,
    storeOwners: leads.filter((l) => l.user_type === 'store_owner').length,
    agencies: leads.filter((l) => l.user_type === 'agency').length,
    avgScore: leads.length ? Math.round(leads.reduce((s, l) => s + (l.audit_score ?? 0), 0) / leads.length) : 0,
    highIntent: leads.filter((l) => l.opportunity_level === 'high').length,
    critical: leads.filter((l) => l.opportunity_level === 'critical').length,
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!authorized) return null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Helmet><title>Admin Dashboard — Web Audit Pro</title></Helmet>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Lead management & audit analytics</p>
            </div>
          </div>
          <Button variant="ghost" onClick={signOut}><LogOut className="w-4 h-4" /> Sign Out</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Audits" value={stats.total} icon={<Users className="w-4 h-4" />} />
          <StatCard label="Today" value={stats.daily} icon={<TrendingUp className="w-4 h-4" />} />
          <StatCard label="This Week" value={stats.weekly} icon={<TrendingUp className="w-4 h-4" />} />
          <StatCard label="Avg Score" value={stats.avgScore} icon={<BarChart3 className="w-4 h-4" />} />
          <StatCard label="Store Owners" value={stats.storeOwners} icon={<Store className="w-4 h-4" />} />
          <StatCard label="Agencies" value={stats.agencies} icon={<Briefcase className="w-4 h-4" />} />
          <StatCard label="High Intent" value={stats.highIntent} icon={<TrendingUp className="w-4 h-4 text-warning" />} />
          <StatCard label="Critical" value={stats.critical} icon={<AlertCircle className="w-4 h-4 text-destructive" />} />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'store_owner', 'agency', 'critical', 'high'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 text-xs font-medium rounded-full', filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-xl border border-border/50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Store</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-center px-4 py-3">Score</th>
                <th className="text-center px-4 py-3">Opportunity</th>
                <th className="text-center px-4 py-3">Delivery</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-border/30 hover:bg-muted/20">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{l.full_name}</td>
                  <td className="px-4 py-3 text-xs">{l.email}</td>
                  <td className="px-4 py-3 text-xs">{l.store_url}</td>
                  <td className="px-4 py-3 text-xs">{l.user_type === 'agency' ? `Agency: ${l.agency_name || '—'}` : 'Store Owner'}</td>
                  <td className="px-4 py-3 text-center font-bold">{l.audit_score ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {l.opportunity_level ? (
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', opportunityColors[l.opportunity_level])}>{l.opportunity_level}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    <span className={l.email_sent ? 'text-success' : 'text-muted-foreground'}>✉</span>{' '}
                    <span className={l.telegram_sent ? 'text-success' : 'text-muted-foreground'}>📨</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No leads yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl border border-border/40 p-4">
      <div className="flex items-center justify-between mb-2 text-muted-foreground text-xs">
        <span>{label}</span>{icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
