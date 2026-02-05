 import { useState } from 'react';
 import { useToast } from '@/hooks/use-toast';
import { Hero } from '@/components/Hero';
import { LoadingState } from '@/components/LoadingState';
import { AuditResults } from '@/components/AuditResults';
 import { auditApi } from '@/lib/api/audit';
import { AuditResult, AuditStatus } from '@/types/audit';

const Index = () => {
   const { toast } = useToast();
  const [status, setStatus] = useState<AuditStatus>('idle');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);

   const handleSubmit = async (inputUrl: string) => {
    setUrl(inputUrl);
    setStatus('loading');
 
     try {
       const response = await auditApi.analyzeWebsite(inputUrl);
 
       if (response.success && response.data) {
         setResult(response.data);
         setStatus('complete');
       } else {
         toast({
           title: 'Analysis Failed',
           description: response.error || 'Unable to analyze this website. Please try again.',
           variant: 'destructive',
         });
         setStatus('idle');
       }
     } catch (error) {
       console.error('Audit error:', error);
       toast({
         title: 'Error',
         description: 'An unexpected error occurred. Please try again.',
         variant: 'destructive',
       });
       setStatus('idle');
     }
  };

  const handleReset = () => {
    setStatus('idle');
    setUrl('');
    setResult(null);
  };

  if (status === 'loading') {
    return <LoadingState url={url} />;
  }

  if (status === 'complete' && result) {
    return <AuditResults result={result} onReset={handleReset} />;
  }

  return <Hero onSubmit={handleSubmit} isLoading={false} />;
};

export default Index;
