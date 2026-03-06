import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuditResult } from '@/types/audit';
import { AuditResults } from '@/components/AuditResults';
import { Loader2 } from 'lucide-react';

const Report = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) { setError('Invalid report ID'); setLoading(false); return; }

      const { data, error: dbError } = await supabase
        .from('audit_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError || !data) {
        setError('Report not found');
        setLoading(false);
        return;
      }

      const report = data.result as unknown as AuditResult;
      report.reportId = data.id;
      setResult(report);
      setLoading(false);
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Report Not Found</h1>
        <p className="text-muted-foreground">{error}</p>
        <button onClick={() => navigate('/')} className="text-primary underline">
          Run a new audit
        </button>
      </div>
    );
  }

  return <AuditResults result={result} onReset={() => navigate('/')} />;
};

export default Report;
