import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuditResult } from '@/types/audit';
import { LeadFormData } from '@/types/lead';
import { generateAuditPDF } from '@/lib/pdfGenerator';

interface ProposalDownloadProps {
  result: AuditResult;
  lead?: LeadFormData | null;
}

export const ProposalDownload = ({ result, lead }: ProposalDownloadProps) => {
  const isAgency = lead?.user_type === 'agency';
  const downloadProposal = async () => {
    await generateAuditPDF(result, {
      brandName: isAgency ? (lead?.agency_name || 'Your Agency') : 'Web Audit Pro',
      hideWebAuditProBranding: isAgency,
    });
  };

  return (
    <div className="glass-card rounded-xl p-6 opacity-0 animate-fade-up stagger-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20"><FileText className="w-6 h-6 text-primary" /></div>
          <div>
            <h3 className="font-semibold text-lg">Download Full Proposal</h3>
            <p className="text-sm text-muted-foreground">
              {isAgency ? `Branded as ${lead?.agency_name || 'Your Agency'} — ready to send to clients.` : 'Detailed PDF report with all findings.'}
            </p>
          </div>
        </div>
        <Button variant="gradient" size="lg" onClick={downloadProposal}>
          <Download className="w-5 h-5" /> Download Proposal
        </Button>
      </div>
    </div>
  );
};
