import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuditResult } from '@/types/audit';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const COLORS = {
  primary: [30, 58, 138] as [number, number, number],      // deep blue
  accent: [59, 130, 246] as [number, number, number],       // bright blue
  dark: [15, 23, 42] as [number, number, number],           // slate-900
  text: [30, 41, 59] as [number, number, number],           // slate-800
  muted: [100, 116, 139] as [number, number, number],       // slate-500
  light: [241, 245, 249] as [number, number, number],       // slate-100
  white: [255, 255, 255] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  yellow: [202, 138, 4] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  orange: [234, 88, 12] as [number, number, number],
};

function getStatusLabel(score: number): { label: string; color: [number, number, number] } {
  if (score >= 80) return { label: 'Stable', color: COLORS.green };
  if (score >= 65) return { label: 'Needs Review', color: COLORS.yellow };
  if (score >= 50) return { label: 'Improvement Required', color: COLORS.orange };
  return { label: 'Critical', color: COLORS.red };
}

function getSeverityColor(severity: string): [number, number, number] {
  switch (severity) {
    case 'critical': return COLORS.red;
    case 'error': return COLORS.orange;
    case 'warning': return COLORS.yellow;
    default: return COLORS.accent;
  }
}

export function generateAuditPDF(result: AuditResult): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - 25) {
      doc.addPage();
      y = 25;
    }
  };

  // =================== PAGE 1: COVER ===================
  // Full-page dark header
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, 120, 'F');

  // Accent line
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 120, pageWidth, 3, 'F');

  // Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Website Performance &', pageWidth / 2, 45, { align: 'center' });
  doc.text('ROI Optimization Audit', pageWidth / 2, 58, { align: 'center' });

  // Subtitle details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 200, 230);
  const date = new Date(result.auditDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.text(`PREPARED FOR: ${result.domain}`, pageWidth / 2, 80, { align: 'center' });
  doc.text(`DOMAIN: ${result.url}`, pageWidth / 2, 88, { align: 'center' });
  doc.text(`DATE: ${date}`, pageWidth / 2, 96, { align: 'center' });
  doc.text('PREPARED BY: WebAudit Pro', pageWidth / 2, 104, { align: 'center' });

  // =================== 1. EXECUTIVE SUMMARY ===================
  y = 140;
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Summary', margin, y);
  y += 10;

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryText = `This audit provides a strategic analysis of the current digital infrastructure of ${result.domain}. Our evaluation identifies ${result.issues.length} critical friction points currently obstructing search visibility, brand trust, and conversion efficiency.\n\nBy implementing the recommended optimizations, ${result.domain} stands to recover significant lost revenue and capitalize on untapped market demand.`;
  const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 8;

  // Performance Snapshot table
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Snapshot', margin, y);
  y += 6;

  const annualImpact = (result.totalRevenueLoss + result.potentialRevenueGain) * 12;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [],
    body: [
      ['Overall Website Health Score:', `${result.overallScore} / 100`],
      ['Identified Monthly Revenue Loss:', formatCurrency(result.totalRevenueLoss)],
      ['Projected Monthly Revenue Gain:', formatCurrency(result.potentialRevenueGain)],
      ['Total Annual Growth Opportunity:', formatCurrency(annualImpact)],
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4, textColor: COLORS.text },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 90 },
      1: { fontStyle: 'bold', halign: 'right', textColor: COLORS.primary },
    },
    alternateRowStyles: { fillColor: COLORS.light },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Departmental Scores
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Departmental Scores', margin, y);
  y += 6;

  const scoreRows: string[][] = [];
  const categoryScoreMap: Record<string, number> = {
    'Security': result.securityScore,
    'SEO': result.seoScore,
    'Performance': result.pageSpeed,
    'Mobile': result.mobileScore,
    'Accessibility': result.accessibilityScore,
    'Conversion': result.conversionScore,
  };

  // Also add categories from the result
  result.categories.forEach(cat => {
    const status = getStatusLabel(cat.score);
    scoreRows.push([cat.name, `${cat.score}/100`, status.label]);
  });

  // If no categories, use the individual scores
  if (scoreRows.length === 0) {
    Object.entries(categoryScoreMap).forEach(([name, score]) => {
      const status = getStatusLabel(score);
      scoreRows.push([name, `${score}/100`, status.label]);
    });
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Category', 'Score', 'Status']],
    body: scoreRows,
    theme: 'grid',
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4, textColor: COLORS.text },
    columnStyles: {
      1: { halign: 'center', fontStyle: 'bold' },
      2: { halign: 'center' },
    },
    alternateRowStyles: { fillColor: COLORS.light },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const val = data.cell.raw as string;
        if (val === 'Critical') data.cell.styles.textColor = COLORS.red;
        else if (val === 'Improvement Required') data.cell.styles.textColor = COLORS.orange;
        else if (val === 'Needs Review') data.cell.styles.textColor = COLORS.yellow;
        else if (val === 'Stable') data.cell.styles.textColor = COLORS.green;
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // =================== 2. CRITICAL FINDINGS ===================
  checkPageBreak(30);
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Critical Findings & Strategic Recommendations', margin, y);
  y += 12;

  const severityOrder = ['critical', 'error', 'warning', 'info'];
  const sortedIssues = [...result.issues].sort((a, b) =>
    severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  // Group issues by category
  const issuesByCategory: Record<string, typeof sortedIssues> = {};
  sortedIssues.forEach(issue => {
    if (!issuesByCategory[issue.category]) issuesByCategory[issue.category] = [];
    issuesByCategory[issue.category].push(issue);
  });

  let globalIssueIndex = 1;
  let categoryIndex = 1;

  Object.entries(issuesByCategory).forEach(([category, issues]) => {
    checkPageBreak(30);

    // Category header
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`2.${categoryIndex} ${category}`, margin, y);
    y += 8;

    issues.forEach((issue) => {
      checkPageBreak(55);

      // Issue title with severity badge
      const sevColor = getSeverityColor(issue.severity);
      doc.setFillColor(...sevColor);
      doc.roundedRect(margin, y - 4, 4, 4, 1, 1, 'F');

      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Issue #${globalIssueIndex}: ${issue.title}`, margin + 8, y);
      y += 7;

      // Severity & Priority tags
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setFillColor(...sevColor);
      doc.roundedRect(margin, y - 3, 30, 5, 1, 1, 'F');
      doc.setTextColor(...COLORS.white);
      doc.text(issue.severity.toUpperCase(), margin + 15, y, { align: 'center' });

      doc.setFillColor(...COLORS.muted);
      doc.roundedRect(margin + 33, y - 3, 30, 5, 1, 1, 'F');
      doc.text(`${issue.priority.toUpperCase()} PRIORITY`, margin + 48, y, { align: 'center' });
      y += 8;

      // Finding
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Finding:', margin, y);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(issue.description, contentWidth - 5);
      y += 5;
      doc.text(descLines, margin, y);
      y += descLines.length * 4.5 + 3;

      checkPageBreak(25);

      // Impact
      doc.setFont('helvetica', 'bold');
      doc.text('Impact:', margin, y);
      doc.setFont('helvetica', 'normal');
      const impactLines = doc.splitTextToSize(issue.impact, contentWidth - 5);
      y += 5;
      doc.text(impactLines, margin, y);
      y += impactLines.length * 4.5 + 3;

      checkPageBreak(20);

      // Recommendation
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendation:', margin, y);
      doc.setFont('helvetica', 'normal');
      const recLines = doc.splitTextToSize(issue.recommendation, contentWidth - 5);
      y += 5;
      doc.text(recLines, margin, y);
      y += recLines.length * 4.5 + 3;

      // Revenue line
      doc.setTextColor(...COLORS.green);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Projected Monthly Gain: ${formatCurrency(issue.revenueGain)}`, margin, y);
      y += 3;

      if (issue.revenueLoss > 0) {
        doc.setTextColor(...COLORS.red);
        doc.text(`Estimated Monthly Loss: ${formatCurrency(issue.revenueLoss)}`, margin, y);
        y += 3;
      }

      y += 8;

      // Divider line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      globalIssueIndex++;
    });

    categoryIndex++;
  });

  // =================== 3. IMPLEMENTATION ROADMAP ===================
  checkPageBreak(40);
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Implementation Roadmap', margin, y);
  y += 12;

  const phases = [
    {
      title: 'Phase 1: High Priority (Immediate)',
      filter: 'high',
      color: COLORS.red,
    },
    {
      title: 'Phase 2: Medium Priority (30 Days)',
      filter: 'medium',
      color: COLORS.yellow,
    },
    {
      title: 'Phase 3: Strategic Growth (90 Days)',
      filter: 'low',
      color: COLORS.green,
    },
  ];

  phases.forEach(phase => {
    const phaseIssues = sortedIssues.filter(i => i.priority === phase.filter);
    if (phaseIssues.length === 0) return;

    checkPageBreak(20);

    doc.setFillColor(...phase.color);
    doc.roundedRect(margin, y - 4, 3, 6, 1, 1, 'F');
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(phase.title, margin + 6, y);
    y += 7;

    const totalGain = phaseIssues.reduce((sum, i) => sum + i.revenueGain, 0);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);

    phaseIssues.forEach(issue => {
      checkPageBreak(8);
      doc.text(`•  ${issue.title}`, margin + 6, y);
      y += 5;
    });

    doc.setTextColor(...COLORS.green);
    doc.setFont('helvetica', 'bold');
    doc.text(`Revenue Impact: +${formatCurrency(totalGain)} / month`, margin + 6, y);
    y += 10;
  });

  // =================== 4. ROI SUMMARY ===================
  checkPageBreak(60);
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('4. ROI Summary & Conclusion', margin, y);
  y += 10;

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const conclusionText = `The data suggests that the technical and cosmetic issues on ${result.domain} are costing the business approximately ${formatCurrency(result.totalRevenueLoss)} every month. By executing this optimization plan, the brand can transition from a "leaky bucket" to a high-performance sales engine.`;
  const conclusionLines = doc.splitTextToSize(conclusionText, contentWidth);
  doc.text(conclusionLines, margin, y);
  y += conclusionLines.length * 5 + 8;

  // Final ROI table
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [],
    body: [
      ['Monthly Revenue Recovery:', formatCurrency(result.totalRevenueLoss)],
      ['Additional Monthly Revenue:', formatCurrency(result.potentialRevenueGain)],
      ['Total Monthly Impact:', formatCurrency(result.totalRevenueLoss + result.potentialRevenueGain)],
      ['Total Annual Impact:', formatCurrency(annualImpact)],
    ],
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 5, textColor: COLORS.text },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { fontStyle: 'bold', halign: 'right', textColor: COLORS.green, fontSize: 12 },
    },
    alternateRowStyles: { fillColor: COLORS.light },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Annual highlight box
  checkPageBreak(25);
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, y, contentWidth, 18, 3, 3, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Annual Impact: ${formatCurrency(annualImpact)}`, pageWidth / 2, y + 11, { align: 'center' });
  y += 28;

  // Next Steps
  checkPageBreak(40);
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Next Steps', margin, y);
  y += 8;

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const steps = [
    'Review the high-priority issues and begin implementation immediately.',
    'Schedule implementation of medium-priority items within the next 30 days.',
    'Plan for low-priority optimizations within the next quarter.',
    'Consider a follow-up audit in 90 days to measure improvements.',
  ];

  steps.forEach((step, i) => {
    checkPageBreak(8);
    doc.text(`${i + 1}.  ${step}`, margin, y);
    y += 6;
  });

  // Footer on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text('Generated by WebAudit Pro', margin, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    // Bottom accent line
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, pageHeight - 5, pageWidth, 2, 'F');
  }

  // Save
  doc.save(`website-audit-${result.domain.replace(/\./g, '-')}.pdf`);
}
