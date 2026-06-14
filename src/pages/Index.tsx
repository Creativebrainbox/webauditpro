import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';
import { Hero } from '@/components/Hero';
import { UserTypeSelect } from '@/components/UserTypeSelect';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { LoadingState } from '@/components/LoadingState';
import { AuditResults } from '@/components/AuditResults';
import { auditApi } from '@/lib/api/audit';
import { saveLeadAndNotify } from '@/lib/api/leads';
import { AuditResult } from '@/types/audit';
import { LeadFormData, UserType } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type Step = 'select_type' | 'lead_form' | 'loading' | 'complete';

const Index = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('select_type');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [lead, setLead] = useState<LeadFormData | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleTypeSelected = (t: UserType) => {
    setUserType(t);
    setStep('lead_form');
  };

  const handleLeadSubmit = async (data: LeadFormData) => {
    setLead(data);
    setStep('loading');
    try {
      const res = await auditApi.analyzeWebsite(data.store_url);
      if (res.success && res.data) {
        const enriched: AuditResult = { ...res.data };
        setResult(enriched);
        setStep('complete');
        // fire-and-forget lead capture + telegram + email
        saveLeadAndNotify(data, enriched);
      } else {
        toast({ title: 'Analysis Failed', description: res.error || 'Unable to analyze this website.', variant: 'destructive' });
        setStep('lead_form');
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Unexpected error. Please try again.', variant: 'destructive' });
      setStep('lead_form');
    }
  };

  const handleReset = () => {
    setStep('select_type');
    setUserType(null);
    setLead(null);
    setResult(null);
  };

  if (step === 'loading' && lead) return <LoadingState url={lead.store_url} />;
  if (step === 'complete' && result) return <AuditResults result={result} lead={lead} onReset={handleReset} />;

  return (
    <>
      <Helmet>
        <link rel="canonical" href="https://webauditpro.lovable.app/" />
        <meta property="og:url" content="https://webauditpro.lovable.app/" />
      </Helmet>
      <Hero>
        {step === 'select_type' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Who are you?</h2>
              <p className="text-muted-foreground">Choose your profile — we'll tailor your report.</p>
            </div>
            <UserTypeSelect value={userType} onChange={handleTypeSelected} />
          </div>
        )}
        {step === 'lead_form' && userType && (
          <div className="space-y-4">
            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={() => setStep('select_type')} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Change profile
              </Button>
            </div>
            <LeadCaptureForm userType={userType} onSubmit={handleLeadSubmit} isLoading={false} />
          </div>
        )}
      </Hero>
    </>
  );
};

export default Index;
