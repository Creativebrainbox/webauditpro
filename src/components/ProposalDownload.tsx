import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuditResult } from '@/types/audit';
import { generateAuditPDF } from '@/lib/pdfGenerator';

interface ProposalDownloadProps {
  result: AuditResult;
}

export const ProposalDownload = ({ result }: ProposalDownloadProps) => {
  const downloadProposal = () => {
    generateAuditPDF(result);
  };

  return (
    <div className="glass-card rounded-xl p-6 opacity-0 animate-fade-up stagger-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Download Full Proposal</h3>
            <p className="text-sm text-muted-foreground">
              Get a detailed report with all findings and recommendations
            </p>
          </div>
        </div>
        
        <Button variant="gradient" size="lg" onClick={downloadProposal}>
          <Download className="w-5 h-5" />
          Download Proposal
        </Button>
      </div>
    </div>
  );
};
