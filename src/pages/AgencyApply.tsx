import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase, CheckCircle2, Clock, XCircle } from 'lucide-react';

type Status = 'pending' | 'approved' | 'rejected';

interface AppRow {
  id: string;
  application_status: Status;
  agency_name: string;
  rejection_reason: string | null;
  created_at: string;
}

export default function AgencyApply() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [existing, setExisting] = useState<AppRow | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [agencyWebsite, setAgencyWebsite] = useState('');
  const [agencyLogoUrl, setAgencyLogoUrl] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session) {
        setEmail(data.session.user.email || '');
        const { data: rows } = await (supabase as any)
          .from('agency_applications')
          .select('id, application_status, agency_name, rejection_reason, created_at')
          .eq('user_id', data.session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (rows && rows.length) setExisting(rows[0] as AppRow);
      }
      setLoading(false);
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let userId = session?.user?.id ?? null;
      if (!session) {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/apply`, data: { full_name: fullName } },
        });
        if (error) throw error;
        userId = data.user?.id ?? null;
      }
      const { error: insErr } = await (supabase as any).from('agency_applications').insert({
        user_id: userId,
        full_name: fullName,
        email,
        agency_name: agencyName,
        agency_website: agencyWebsite || null,
        agency_logo_url: agencyLogoUrl || null,
      });
      if (insErr) throw insErr;
      toast({ title: 'Application submitted', description: 'We will review and get back to you shortly.' });
      navigate('/apply');
      // reload state
      setTimeout(() => window.location.reload(), 400);
    } catch (e: any) {
      toast({ title: 'Submission failed', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <Helmet><title>Agency Application — Web Audit Pro</title></Helmet>
      <div className="w-full max-w-lg space-y-4">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-primary/15 mb-3"><Briefcase className="w-6 h-6 text-primary" /></div>
          <h1 className="text-2xl font-bold">Agency / Shopify Expert Application</h1>
          <p className="text-sm text-muted-foreground mt-1">Apply to run white-label audits for your clients.</p>
        </div>

        {existing ? (
          <div className="glass-card border border-border/50 rounded-2xl p-6 space-y-3 text-center">
            {existing.application_status === 'pending' && (
              <>
                <Clock className="w-10 h-10 mx-auto text-warning" />
                <h2 className="text-lg font-semibold">Application under review</h2>
                <p className="text-sm text-muted-foreground">Your application for <b>{existing.agency_name}</b> was submitted {new Date(existing.created_at).toLocaleDateString()}. You'll be notified once it's reviewed.</p>
              </>
            )}
            {existing.application_status === 'approved' && (
              <>
                <CheckCircle2 className="w-10 h-10 mx-auto text-success" />
                <h2 className="text-lg font-semibold">Approved</h2>
                <p className="text-sm text-muted-foreground">Welcome aboard. You can now access your agency dashboard.</p>
                <Button onClick={() => navigate('/admin')} variant="hero">Open Dashboard</Button>
              </>
            )}
            {existing.application_status === 'rejected' && (
              <>
                <XCircle className="w-10 h-10 mx-auto text-destructive" />
                <h2 className="text-lg font-semibold">Application not approved</h2>
                {existing.rejection_reason && <p className="text-sm text-muted-foreground">Reason: {existing.rejection_reason}</p>}
              </>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="glass-card border border-border/50 rounded-2xl p-6 space-y-4">
            <div className="grid gap-3">
              <div>
                <Label>Full Name</Label>
                <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!session} />
              </div>
              {!session && (
                <div>
                  <Label>Password</Label>
                  <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">Creates your account so you can log in and track your application.</p>
                </div>
              )}
              <div>
                <Label>Agency Name</Label>
                <Input required value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
              </div>
              <div>
                <Label>Agency Website (optional)</Label>
                <Input type="url" value={agencyWebsite} onChange={(e) => setAgencyWebsite(e.target.value)} placeholder="https://" />
              </div>
              <div>
                <Label>Agency Logo URL (optional)</Label>
                <Input type="url" value={agencyLogoUrl} onChange={(e) => setAgencyLogoUrl(e.target.value)} placeholder="https://.../logo.png" />
              </div>
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Application'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Approvals are reviewed by the platform owner. You'll get access to the agency dashboard once approved.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
