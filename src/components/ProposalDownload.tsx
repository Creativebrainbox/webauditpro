import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuditResult } from '@/types/audit';

interface ProposalDownloadProps {
  result: AuditResult;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const ProposalDownload = ({ result }: ProposalDownloadProps) => {
  const generateProposalContent = (): string => {
    const date = new Date(result.auditDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const severityOrder = ['critical', 'error', 'warning', 'info'];
    const sortedIssues = [...result.issues].sort((a, b) => 
      severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
    );

    let content = `
================================================================================
                         WEBSITE AUDIT PROPOSAL
================================================================================

Domain: ${result.domain}
Audit Date: ${date}
Overall Score: ${result.overallScore}/100

================================================================================
                         EXECUTIVE SUMMARY
================================================================================

This comprehensive audit of ${result.domain} has identified ${result.issues.length} issues
that are impacting your website's performance, user experience, and revenue potential.

KEY FINDINGS:
-------------
• Overall Website Score: ${result.overallScore}/100
• Total Monthly Revenue Loss: ${formatCurrency(result.totalRevenueLoss)}
• Potential Monthly Revenue Gain: ${formatCurrency(result.potentialRevenueGain)}
• Annual Revenue Opportunity: ${formatCurrency((result.totalRevenueLoss + result.potentialRevenueGain) * 12)}

CATEGORY SCORES:
----------------
${result.categories.map(cat => `• ${cat.name}: ${cat.score}/100 (${cat.issues.length} issues)`).join('\n')}

================================================================================
                         DETAILED FINDINGS & RECOMMENDATIONS
================================================================================

`;

    sortedIssues.forEach((issue, index) => {
      content += `
--------------------------------------------------------------------------------
ISSUE #${index + 1}: ${issue.title}
--------------------------------------------------------------------------------

SEVERITY: ${issue.severity.toUpperCase()}
CATEGORY: ${issue.category}
PRIORITY: ${issue.priority.toUpperCase()}

DESCRIPTION:
${issue.description}

BUSINESS IMPACT:
${issue.impact}

RECOMMENDATION:
${issue.recommendation}

REVENUE ANALYSIS:
• Estimated Monthly Revenue Loss: ${formatCurrency(issue.revenueLoss)}
• Projected Monthly Revenue Gain if Fixed: ${formatCurrency(issue.revenueGain)}
• Annual Impact: ${formatCurrency((issue.revenueLoss + issue.revenueGain) * 12)}

`;
    });

    content += `
================================================================================
                         IMPLEMENTATION PRIORITY
================================================================================

HIGH PRIORITY (Immediate Action Required):
${sortedIssues.filter(i => i.priority === 'high').map(i => `• ${i.title} - ${formatCurrency(i.revenueGain)} potential gain`).join('\n') || 'None'}

MEDIUM PRIORITY (Within 30 Days):
${sortedIssues.filter(i => i.priority === 'medium').map(i => `• ${i.title} - ${formatCurrency(i.revenueGain)} potential gain`).join('\n') || 'None'}

LOW PRIORITY (Within 90 Days):
${sortedIssues.filter(i => i.priority === 'low').map(i => `• ${i.title} - ${formatCurrency(i.revenueGain)} potential gain`).join('\n') || 'None'}

================================================================================
                         ROI SUMMARY
================================================================================

By implementing all recommendations in this proposal, you can expect:

• Monthly Revenue Recovery: ${formatCurrency(result.totalRevenueLoss)}
• Additional Monthly Revenue: ${formatCurrency(result.potentialRevenueGain)}
• Total Monthly Impact: ${formatCurrency(result.totalRevenueLoss + result.potentialRevenueGain)}
• Annual Revenue Impact: ${formatCurrency((result.totalRevenueLoss + result.potentialRevenueGain) * 12)}

================================================================================
                         NEXT STEPS
================================================================================

1. Review the high-priority issues and begin implementation immediately
2. Schedule implementation of medium-priority items within the next 30 days
3. Plan for low-priority optimizations within the next quarter
4. Consider a follow-up audit in 90 days to measure improvements

================================================================================

This proposal was generated by WebAudit Pro
For questions or implementation assistance, contact our team.

================================================================================
`;

    return content;
  };

  const downloadProposal = () => {
    const content = generateProposalContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `website-audit-proposal-${result.domain.replace(/\./g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
