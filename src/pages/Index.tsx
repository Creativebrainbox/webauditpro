import { useState } from 'react';
import { Hero } from '@/components/Hero';
import { LoadingState } from '@/components/LoadingState';
import { AuditResults } from '@/components/AuditResults';
import { generateAuditResult } from '@/lib/mockAuditData';
import { AuditResult, AuditStatus } from '@/types/audit';

const Index = () => {
  const [status, setStatus] = useState<AuditStatus>('idle');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleSubmit = async (inputUrl: string) => {
    setUrl(inputUrl);
    setStatus('loading');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    const auditResult = generateAuditResult(inputUrl);
    setResult(auditResult);
    setStatus('complete');
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
