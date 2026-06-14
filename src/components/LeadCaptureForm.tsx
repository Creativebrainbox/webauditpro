import { useState } from 'react';
import { z } from 'zod';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LeadFormData, UserType } from '@/types/lead';

const baseSchema = z.object({
  full_name: z.string().trim().min(2, 'Name too short').max(100),
  email: z.string().trim().email('Invalid email').max(255),
  store_url: z.string().trim().min(3, 'Required').max(500),
  whatsapp: z.string().trim().max(40).optional().or(z.literal('')),
  company_name: z.string().trim().max(150).optional().or(z.literal('')),
  agency_name: z.string().trim().max(150).optional().or(z.literal('')),
  agency_website: z.string().trim().max(500).optional().or(z.literal('')),
  agency_logo_url: z.string().trim().url('Must be a valid URL').max(500).optional().or(z.literal('')),
});

interface Props {
  userType: UserType;
  onSubmit: (data: LeadFormData) => void;
  isLoading: boolean;
}

export const LeadCaptureForm = ({ userType, onSubmit, isLoading }: Props) => {
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = baseSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: 'Please check the form', description: parsed.error.errors[0].message, variant: 'destructive' });
      return;
    }
    if (userType === 'agency' && !form.agency_name?.trim()) {
      toast({ title: 'Agency name required', variant: 'destructive' });
      return;
    }
    onSubmit({ ...(parsed.data as any), user_type: userType });
  };

  return (
    <form onSubmit={handle} className="glass-card rounded-2xl border border-border/50 p-6 md:p-8 max-w-2xl mx-auto space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold mb-1">Tell us where to send the report</h2>
        <p className="text-sm text-muted-foreground">Your full audit + PDF will be emailed to you instantly.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input id="full_name" required maxLength={100} value={form.full_name || ''} onChange={(e) => set('full_name', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" required maxLength={255} value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="store_url">Store URL *</Label>
        <Input id="store_url" required placeholder="example.com" maxLength={500} value={form.store_url || ''} onChange={(e) => set('store_url', e.target.value)} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Input id="whatsapp" placeholder="+1 555 000 0000" maxLength={40} value={form.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company_name">Company <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Input id="company_name" maxLength={150} value={form.company_name || ''} onChange={(e) => set('company_name', e.target.value)} />
        </div>
      </div>

      {userType === 'agency' && (
        <div className="space-y-4 pt-4 border-t border-border/50">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-primary">White-Label Branding</h3>
          <div className="space-y-1.5">
            <Label htmlFor="agency_name">Agency Name *</Label>
            <Input id="agency_name" required maxLength={150} value={form.agency_name || ''} onChange={(e) => set('agency_name', e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="agency_website">Agency Website</Label>
              <Input id="agency_website" placeholder="https://youragency.com" maxLength={500} value={form.agency_website || ''} onChange={(e) => set('agency_website', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agency_logo_url">Agency Logo URL</Label>
              <Input id="agency_logo_url" placeholder="https://.../logo.png" maxLength={500} value={form.agency_logo_url || ''} onChange={(e) => set('agency_logo_url', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      <Button type="submit" variant="hero" size="lg" disabled={isLoading} className="w-full">
        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Running audit...</> : <>Run My Free Audit <ArrowRight className="w-5 h-5" /></>}
      </Button>
      <p className="text-xs text-center text-muted-foreground">By submitting you agree to receive your audit report by email.</p>
    </form>
  );
};
