import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/admin');
    });
  }, [navigate]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast({ title: 'Account created', description: 'Check your inbox to confirm, then sign in.' });
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/admin');
      }
    } catch (e: any) {
      toast({ title: 'Auth error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Helmet><title>Admin Sign In — Web Audit Pro</title></Helmet>
      <form onSubmit={handle} className="glass-card border border-border/50 rounded-2xl p-8 w-full max-w-md space-y-5">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-primary/15 mb-3"><Shield className="w-6 h-6 text-primary" /></div>
          <h1 className="text-2xl font-bold">{mode === 'signin' ? 'Admin Sign In' : 'Create Admin Account'}</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage leads and audit results</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" variant="hero" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </Button>
        <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
        <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/40">
          Admin access requires the <code className="text-primary">admin</code> role to be granted to your account.
        </p>
      </form>
    </div>
  );
}
