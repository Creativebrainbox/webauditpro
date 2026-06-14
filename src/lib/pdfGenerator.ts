import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuditResult, AuditIssue } from '@/types/audit';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const COLORS = {
  primary: [30, 58, 138] as [number, number, number],
  accent: [59, 130, 246] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  text: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  light: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  greenSoft: [220, 252, 231] as [number, number, number],
  yellow: [202, 138, 4] as [number, number, number],
  yellowSoft: [254, 249, 195] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  redSoft: [254, 226, 226] as [number, number, number],
  orange: [234, 88, 12] as [number, number, number],
  blueSoft: [219, 234, 254] as [number, number, number],
};

function getStatusLabel(score: number): { label: string; color: [number, number, number] } {
  if (score >= 80) return { label: 'Stable', color: COLORS.green };
  if (score >= 65) return { label: 'Needs Review', color: COLORS.yellow };
  if (score >= 50) return { label: 'Improvement Required', color: COLORS.orange };
  return { label: 'Critical', color: COLORS.red };
}

// ---------- SWOT derivation ----------
interface SwotItem { title: string; detail: string; tag?: string }
interface SwotData {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

function buildSwot(result: AuditResult): SwotData {
  const strengths: SwotItem[] = [];
  const weaknesses: SwotItem[] = [];
  const opportunities: SwotItem[] = [];
  const threats: SwotItem[] = [];

  // --- Strengths from category scores ---
  const scoreMap: { name: string; score: number }[] = [
    { name: 'SEO', score: result.seoScore },
    { name: 'Performance', score: result.pageSpeed },
    { name: 'Security', score: result.securityScore },
    { name: 'Accessibility', score: result.accessibilityScore },
    { name: 'Mobile Experience', score: result.mobileScore },
    { name: 'Conversion Readiness', score: result.conversionScore },
  ];
  scoreMap.forEach(s => {
    if (s.score >= 80) {
      strengths.push({
        title: `Strong ${s.name} foundation`,
        detail: `Scoring ${s.score}/100, ${s.name.toLowerCase()} is performing above industry benchmarks and reinforces user trust.`,
        tag: `${s.score}/100`,
      });
    } else if (s.score < 50) {
      weaknesses.push({
        title: `Underperforming ${s.name}`,
        detail: `${s.name} scored ${s.score}/100, signalling a structural gap that erodes user experience and search visibility.`,
        tag: `${s.score}/100`,
      });
    }
  });

  // --- Strengths from passing checks ---
  result.issues
    .filter(i => i.severity === 'info')
    .slice(0, 6)
    .forEach(i =>
      strengths.push({ title: i.title, detail: i.description, tag: i.category })
    );

  // --- Weaknesses from critical / error issues ---
  result.issues
    .filter(i => i.severity === 'critical' || i.severity === 'error')
    .forEach(i =>
      weaknesses.push({
        title: i.title,
        detail: `${i.description} ${i.recommendation ? 'Fix: ' + i.recommendation : ''}`.trim(),
        tag: i.category,
      })
    );

  // --- Threats: security/compliance warnings + competitor advantages ---
  const threatCategories = ['Security', 'SSL', 'Headers', 'DNS', 'Email', 'Legal', 'Safe Browsing'];
  result.issues
    .filter(i => i.severity === 'warning' && threatCategories.some(c => i.category.toLowerCase().includes(c.toLowerCase())))
    .forEach(i =>
      threats.push({
        title: i.title,
        detail: i.description,
        tag: i.category,
      })
    );

  if (result.competitors) {
    result.competitors.forEach(c => {
      if (c.healthScore > result.overallScore) {
        threats.push({
          title: `${c.name} outranks you`,
          detail: `Competitor health score ${c.healthScore} vs. your ${result.overallScore}. Authority gap: ${c.authorityGap}, content gap: ${c.contentVolumeGap}, speed gap: ${c.pageSpeedGap}.`,
          tag: 'Competitor',
        });
      }
    });
  }

  if (result.totalRevenueLoss > 0) {
    threats.push({
      title: 'Active monthly revenue leakage',
      detail: `Current friction is estimated to cost ${formatCurrency(result.totalRevenueLoss)} every month in lost conversions and traffic.`,
      tag: 'Revenue',
    });
  }

  // --- Opportunities from keywords + growth forecast + closeable gaps ---
  if (result.keywords) {
    result.keywords
      .filter(k => k.opportunity === 'High')
      .slice(0, 6)
      .forEach(k =>
        opportunities.push({
          title: `Capture "${k.keyword}"`,
          detail: `${k.monthlySearches.toLocaleString()} monthly searches, ${k.competition.toLowerCase()} competition, currently ranked ${k.currentRank}.`,
          tag: 'Keyword',
        })
      );
  }
  if (result.growthForecast) {
    result.growthForecast.slice(0, 6).forEach(g =>
      opportunities.push({
        title: g.area,
        detail: `${g.action} — projected SEO lift ${g.seoLift}, conversion lift ${g.conversionLift}.`,
        tag: 'Growth',
      })
    );
  }
  if (result.potentialRevenueGain > 0) {
    opportunities.push({
      title: 'Recoverable monthly revenue',
      detail: `Implementing the recommended fixes is projected to unlock ${formatCurrency(result.potentialRevenueGain)} in additional monthly revenue.`,
      tag: 'Revenue',
    });
  }

  // Fallbacks so quadrants are never empty
  if (strengths.length === 0)
    strengths.push({ title: 'Site is online and indexable', detail: 'The domain responds and serves content to search engines.' });
  if (weaknesses.length === 0)
    weaknesses.push({ title: 'No critical weaknesses surfaced', detail: 'Continue monitoring scores monthly to maintain posture.' });
  if (opportunities.length === 0)
    opportunities.push({ title: 'Compound on current strengths', detail: 'Double down on the highest-scoring categories to widen the competitive moat.' });
  if (threats.length === 0)
    threats.push({ title: 'Watch for emerging competitors', detail: 'Maintain quarterly competitive scans to detect shifts early.' });

  return { strengths, weaknesses, opportunities, threats };
}

async function fetchImageAsDataUrl(url: string): Promise<{ data: string; format: 'PNG' | 'JPEG' } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const format: 'PNG' | 'JPEG' = blob.type.includes('png') ? 'PNG' : 'JPEG';
    const data: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return { data, format };
  } catch {
    return null;
  }
}

export interface PdfBranding {
  brandName?: string;
  hideWebAuditProBranding?: boolean;
}

export async function generateAuditPDF(result: AuditResult, branding: PdfBranding = {}): Promise<void> {
  const brandName = branding.brandName || 'Web Audit Pro';
  const footerLabel = branding.hideWebAuditProBranding ? `${brandName} — SWOT Strategic Report` : 'Web Audit Pro — SWOT Strategic Report';
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

  const swot = buildSwot(result);
  const annualImpact = (result.totalRevenueLoss + result.potentialRevenueGain) * 12;

  // Pre-fetch website screenshot for the cover
  const screenshot = result.screenshotUrl ? await fetchImageAsDataUrl(result.screenshotUrl) : null;

  // =================== COVER ===================
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, 130, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 130, pageWidth, 3, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('STRATEGIC WEBSITE AUDIT', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('SWOT Analysis Report', pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 200, 230);
  doc.text('Strengths · Weaknesses · Opportunities · Threats', pageWidth / 2, 72, { align: 'center' });

  const date = new Date(result.auditDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.setFontSize(11);
  doc.text(`PREPARED FOR: ${result.domain}`, pageWidth / 2, 95, { align: 'center' });
  doc.text(`DOMAIN: ${result.url}`, pageWidth / 2, 103, { align: 'center' });
  doc.text(`DATE: ${date}`, pageWidth / 2, 111, { align: 'center' });
  doc.text(`PREPARED BY: ${brandName}`, pageWidth / 2, 119, { align: 'center' });

  // =================== WEBSITE PREVIEW (proof of site) ===================
  if (screenshot) {
    const previewW = contentWidth;
    const previewH = 95;
    const previewY = 142;

    doc.setFillColor(...COLORS.light);
    doc.roundedRect(margin, previewY, previewW, 8, 1.5, 1.5, 'F');
    doc.setFillColor(...COLORS.red);
    doc.circle(margin + 4, previewY + 4, 1.3, 'F');
    doc.setFillColor(...COLORS.yellow);
    doc.circle(margin + 8, previewY + 4, 1.3, 'F');
    doc.setFillColor(...COLORS.green);
    doc.circle(margin + 12, previewY + 4, 1.3, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(result.url, margin + 18, previewY + 5.2);

    try {
      doc.addImage(screenshot.data, screenshot.format, margin, previewY + 8, previewW, previewH);
    } catch {
      doc.setFillColor(...COLORS.light);
      doc.rect(margin, previewY + 8, previewW, previewH, 'F');
    }
    doc.setDrawColor(...COLORS.muted);
    doc.setLineWidth(0.2);
    doc.rect(margin, previewY + 8, previewW, previewH);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.muted);
    doc.text('Captured front-page snapshot of the audited site.', pageWidth / 2, previewY + previewH + 14, { align: 'center' });

    doc.addPage();
    y = 25;
  } else {
    y = 150;
  }

  // =================== EXECUTIVE SUMMARY ===================
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, y);
  y += 9;

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryText = `This SWOT-based audit assesses ${result.domain} across SEO, performance, security, content, and conversion dimensions. We identified ${swot.strengths.length} strengths to defend, ${swot.weaknesses.length} weaknesses to remediate, ${swot.opportunities.length} opportunities to capture, and ${swot.threats.length} threats to mitigate.`;
  const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 6;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    body: [
      ['Overall Health Score', `${result.overallScore} / 100`],
      ['Monthly Revenue Loss', formatCurrency(result.totalRevenueLoss)],
      ['Projected Monthly Gain', formatCurrency(result.potentialRevenueGain)],
      ['Annual Growth Opportunity', formatCurrency(annualImpact)],
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4, textColor: COLORS.text },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 90 },
      1: { fontStyle: 'bold', halign: 'right', textColor: COLORS.primary },
    },
    alternateRowStyles: { fillColor: COLORS.light },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // =================== SWOT MATRIX (visual 2x2) ===================
  doc.addPage();
  y = 25;
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SWOT Matrix', margin, y);
  y += 6;
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('A strategic snapshot of internal posture and external positioning.', margin, y);
  y += 10;

  const cellW = (contentWidth - 6) / 2;
  const cellH = 110;

  const drawQuadrant = (
    x: number,
    qy: number,
    title: string,
    items: SwotItem[],
    bg: [number, number, number],
    accent: [number, number, number],
    icon: string
  ) => {
    doc.setFillColor(...bg);
    doc.roundedRect(x, qy, cellW, cellH, 3, 3, 'F');

    // header bar
    doc.setFillColor(...accent);
    doc.roundedRect(x, qy, cellW, 12, 3, 3, 'F');
    doc.rect(x, qy + 6, cellW, 6, 'F');

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${icon}  ${title}`, x + 5, qy + 8);

    doc.setTextColor(...COLORS.text);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    let ty = qy + 18;
    const max = 5;
    items.slice(0, max).forEach(item => {
      const line = doc.splitTextToSize(`• ${item.title}`, cellW - 8);
      if (ty + line.length * 4 > qy + cellH - 4) return;
      doc.setFont('helvetica', 'bold');
      doc.text(line, x + 4, ty);
      ty += line.length * 4 + 1;
    });
    if (items.length > max) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...COLORS.muted);
      doc.text(`+ ${items.length - max} more — see detail`, x + 4, qy + cellH - 4);
    }
  };

  drawQuadrant(margin, y, 'STRENGTHS', swot.strengths, COLORS.greenSoft, COLORS.green, 'S');
  drawQuadrant(margin + cellW + 6, y, 'WEAKNESSES', swot.weaknesses, COLORS.redSoft, COLORS.red, 'W');
  drawQuadrant(margin, y + cellH + 6, 'OPPORTUNITIES', swot.opportunities, COLORS.blueSoft, COLORS.accent, 'O');
  drawQuadrant(margin + cellW + 6, y + cellH + 6, 'THREATS', swot.threats, COLORS.yellowSoft, COLORS.orange, 'T');

  y += cellH * 2 + 16;

  // =================== DETAIL SECTIONS ===================
  const renderQuadrantDetail = (
    title: string,
    subtitle: string,
    items: SwotItem[],
    accent: [number, number, number],
    bg: [number, number, number]
  ) => {
    doc.addPage();
    y = 25;

    // Section header band
    doc.setFillColor(...accent);
    doc.rect(0, y - 10, pageWidth, 22, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y + 3);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(subtitle, margin, y + 10);
    y += 22;

    items.forEach((item, idx) => {
      checkPageBreak(28);

      // Card
      doc.setFillColor(...bg);
      const titleLines = doc.splitTextToSize(`${idx + 1}. ${item.title}`, contentWidth - 14);
      const detailLines = doc.splitTextToSize(item.detail, contentWidth - 14);
      const cardH = 8 + titleLines.length * 5 + detailLines.length * 4.5 + 8;

      doc.roundedRect(margin, y, contentWidth, cardH, 2, 2, 'F');
      doc.setFillColor(...accent);
      doc.rect(margin, y, 3, cardH, 'F');

      // Title
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(titleLines, margin + 7, y + 7);

      // Tag
      if (item.tag) {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accent);
        const tagW = doc.getTextWidth(item.tag.toUpperCase()) + 6;
        doc.setDrawColor(...accent);
        doc.setLineWidth(0.3);
        doc.roundedRect(pageWidth - margin - tagW - 4, y + 3, tagW, 5, 1, 1, 'S');
        doc.text(item.tag.toUpperCase(), pageWidth - margin - tagW / 2 - 4, y + 6.5, { align: 'center' });
      }

      // Detail
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.text(detailLines, margin + 7, y + 7 + titleLines.length * 5 + 3);

      y += cardH + 5;
    });
  };

  renderQuadrantDetail(
    'STRENGTHS',
    'What is working — protect, amplify and market these advantages.',
    swot.strengths,
    COLORS.green,
    COLORS.greenSoft
  );

  renderQuadrantDetail(
    'WEAKNESSES',
    'Internal gaps that are dragging performance down — prioritise for remediation.',
    swot.weaknesses,
    COLORS.red,
    COLORS.redSoft
  );

  renderQuadrantDetail(
    'OPPORTUNITIES',
    'External openings to capture growth, traffic and revenue.',
    swot.opportunities,
    COLORS.accent,
    COLORS.blueSoft
  );

  renderQuadrantDetail(
    'THREATS',
    'External or compounding risks that could erode position if left unaddressed.',
    swot.threats,
    COLORS.orange,
    COLORS.yellowSoft
  );

  // =================== SUPPORTING DATA ===================
  // Departmental scores
  doc.addPage();
  y = 25;
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Supporting Data', margin, y);
  y += 10;

  doc.setFontSize(13);
  doc.text('Departmental Scores', margin, y);
  y += 4;

  const scoreRows: string[][] = [];
  if (result.categories.length) {
    result.categories.forEach(cat => {
      const status = getStatusLabel(cat.score);
      scoreRows.push([cat.name, `${cat.score}/100`, status.label]);
    });
  } else {
    Object.entries({
      Security: result.securityScore,
      SEO: result.seoScore,
      Performance: result.pageSpeed,
      Mobile: result.mobileScore,
      Accessibility: result.accessibilityScore,
      Conversion: result.conversionScore,
    }).forEach(([name, score]) => {
      const status = getStatusLabel(score);
      scoreRows.push([name, `${score}/100`, status.label]);
    });
  }

  autoTable(doc, {
    startY: y + 2,
    margin: { left: margin, right: margin },
    head: [['Category', 'Score', 'Status']],
    body: scoreRows,
    theme: 'grid',
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4, textColor: COLORS.text },
    columnStyles: { 1: { halign: 'center', fontStyle: 'bold' }, 2: { halign: 'center' } },
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
  y = (doc as any).lastAutoTable.finalY + 10;

  // Competitors
  if (result.competitors && result.competitors.length) {
    checkPageBreak(40);
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Competitor Benchmark', margin, y);
    y += 4;
    autoTable(doc, {
      startY: y + 2,
      margin: { left: margin, right: margin },
      head: [['Website', 'Health', 'Authority Gap', 'Content Gap', 'Speed Gap']],
      body: [
        [result.domain, String(result.overallScore), '—', '—', '—'],
        ...result.competitors.map(c => [c.name, String(c.healthScore), c.authorityGap, c.contentVolumeGap, c.pageSpeedGap]),
      ],
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 4, textColor: COLORS.text },
      columnStyles: { 1: { halign: 'center', fontStyle: 'bold' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
      didParseCell: (data) => {
        if (data.section === 'body' && data.row.index === 0) {
          data.cell.styles.fillColor = [235, 244, 255];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Keywords
  if (result.keywords && result.keywords.length) {
    checkPageBreak(40);
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Keyword Opportunities', margin, y);
    y += 4;
    autoTable(doc, {
      startY: y + 2,
      margin: { left: margin, right: margin },
      head: [['Keyword', 'Searches', 'Competition', 'Rank', 'Opportunity']],
      body: result.keywords.map(k => [
        k.keyword,
        k.monthlySearches >= 1000 ? `${(k.monthlySearches / 1000).toFixed(1)}k` : String(k.monthlySearches),
        k.competition,
        k.currentRank,
        k.opportunity,
      ]),
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 4, textColor: COLORS.text },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center', fontStyle: 'bold' } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Growth forecast
  if (result.growthForecast && result.growthForecast.length) {
    checkPageBreak(40);
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('90-Day Growth Forecast', margin, y);
    y += 4;
    autoTable(doc, {
      startY: y + 2,
      margin: { left: margin, right: margin },
      head: [['Area', 'Action', 'SEO Lift', 'Conversion Lift']],
      body: result.growthForecast.map(f => [f.area, f.action, f.seoLift, f.conversionLift]),
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 4, textColor: COLORS.text },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 38 },
        1: { cellWidth: 70 },
        2: { halign: 'center', fontStyle: 'bold', textColor: COLORS.green, cellWidth: 30 },
        3: { halign: 'center', fontStyle: 'bold', textColor: COLORS.accent, cellWidth: 30 },
      },
      alternateRowStyles: { fillColor: COLORS.light },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // =================== TECHNICAL AUDIT DETAIL ===================
  const ext = result.extendedAudit;
  if (ext) {
    doc.addPage();
    y = 25;
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Technical Audit Detail', margin, y);
    y += 4;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.muted);
    doc.text('Deep-dive findings across crawl, schema, AI readiness and ranking signals.', margin, y + 6);
    y += 14;

    const sectionHeader = (title: string) => {
      checkPageBreak(18);
      doc.setFillColor(...COLORS.light);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setFillColor(...COLORS.accent);
      doc.rect(margin, y, 2.5, 8, 'F');
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 6, y + 5.5);
      y += 12;
    };

    // ---- Broken Links ----
    if (ext.brokenLinks) {
      sectionHeader(`Broken Links (${ext.brokenLinks.brokenCount} of ${ext.brokenLinks.totalChecked} checked)`);
      if (ext.brokenLinks.brokenLinks.length === 0) {
        doc.setTextColor(...COLORS.text);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No broken links detected — link integrity is healthy.', margin, y);
        y += 8;
      } else {
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['URL', 'Status', 'Recommended Fix']],
          body: ext.brokenLinks.brokenLinks.slice(0, 40).map(b => [b.url, String(b.statusCode), b.recommendation]),
          theme: 'grid',
          headStyles: { fillColor: COLORS.red, textColor: COLORS.white, fontSize: 9 },
          styles: { fontSize: 8, cellPadding: 3, textColor: COLORS.text, overflow: 'linebreak' },
          columnStyles: { 0: { cellWidth: 75 }, 1: { halign: 'center', cellWidth: 18, fontStyle: 'bold' }, 2: { cellWidth: contentWidth - 93 } },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }
    }

    // ---- Robots.txt ----
    if (ext.robotsTxt) {
      sectionHeader('Robots.txt Review');
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const robotsLine = ext.robotsTxt.exists
        ? `robots.txt found · ${ext.robotsTxt.disallowedPaths.length} Disallow rules · ${ext.robotsTxt.sitemapReferences.length} sitemap references`
        : 'robots.txt missing — search engines crawl with no directives.';
      doc.text(robotsLine, margin, y);
      y += 6;
      const rows = (ext.robotsTxt.disallowedAnalysis ?? []).map(d => [d.path, d.userAgent || '*', d.impact]);
      if (rows.length > 0) {
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['Disallow Path', 'User-Agent', 'SEO Impact']],
          body: rows.slice(0, 25),
          theme: 'grid',
          headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 9 },
          styles: { fontSize: 8.5, cellPadding: 3, textColor: COLORS.text, overflow: 'linebreak' },
          columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' }, 1: { cellWidth: 28, halign: 'center' } },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      } else {
        y += 4;
      }
    }

    // ---- Schema Markup ----
    if (ext.schemaValidation) {
      const s = ext.schemaValidation;
      sectionHeader(`Schema Markup (${s.totalSchemas} schemas · ${s.errorCount} errors · ${s.warningCount} warnings)`);
      if (!s.hasStructuredData) {
        doc.setTextColor(...COLORS.text);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No JSON-LD structured data detected. Rich results in Google and AI engines are unavailable.', margin, y);
        y += 8;
      } else {
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['Schema Type', 'Status', 'Issues']],
          body: s.schemas.slice(0, 20).map(sc => [sc.type, sc.status.toUpperCase(), sc.issues.join(' · ') || '—']),
          theme: 'grid',
          headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 9 },
          styles: { fontSize: 8.5, cellPadding: 3, textColor: COLORS.text, overflow: 'linebreak' },
          columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' }, 1: { cellWidth: 22, halign: 'center' } },
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 1) {
              const v = data.cell.raw as string;
              if (v === 'ERROR') data.cell.styles.textColor = COLORS.red;
              else if (v === 'WARNING') data.cell.styles.textColor = COLORS.orange;
              else data.cell.styles.textColor = COLORS.green;
            }
          },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }
    }

    // ---- AI Readiness & Shopping ----
    if (ext.aiReadiness) {
      const a = ext.aiReadiness;
      sectionHeader(`AI Readiness (${a.recommendationsScore}/100${a.aiShoppingScore != null ? ` · AI Shopping ${a.aiShoppingScore}/100` : ''})`);
      const rows: string[][] = [
        ['llms.txt present', a.hasLlmsTxt ? 'Yes' : 'No'],
        ['Product schema', a.hasProductSchema ? 'Yes' : 'No'],
        ['FAQ schema', a.hasFaqSchema ? 'Yes' : 'No'],
        ['Organization schema', a.hasOrganizationSchema ? 'Yes' : 'No'],
        ['Article schema', a.hasArticleSchema ? 'Yes' : 'No'],
      ];
      a.aiCrawlersAllowed.forEach(c => rows.push([`${c.bot} access`, c.allowed ? 'Allowed' : 'Blocked']));
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Signal', 'Status']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3, textColor: COLORS.text },
        columnStyles: { 1: { halign: 'center', fontStyle: 'bold', cellWidth: 35 } },
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      if (a.aiShoppingSignals && a.aiShoppingSignals.length > 0) {
        checkPageBreak(20);
        doc.setTextColor(...COLORS.primary);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('AI Shopping & Recommendation Signals', margin, y);
        y += 4;
        autoTable(doc, {
          startY: y + 2,
          margin: { left: margin, right: margin },
          head: [['Signal', 'Present', 'Impact']],
          body: a.aiShoppingSignals.map(s => [s.signal, s.present ? 'Yes' : 'No', s.impact]),
          theme: 'grid',
          headStyles: { fillColor: COLORS.accent, textColor: COLORS.white, fontSize: 9 },
          styles: { fontSize: 8.5, cellPadding: 3, textColor: COLORS.text, overflow: 'linebreak' },
          columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' }, 1: { halign: 'center', cellWidth: 18 } },
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 1) {
              data.cell.styles.textColor = (data.cell.raw === 'Yes') ? COLORS.green : COLORS.red;
              data.cell.styles.fontStyle = 'bold';
            }
          },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }
    }

    // ---- SEO Ranking Signals ----
    if (ext.seoRanking) {
      const r = ext.seoRanking;
      sectionHeader(`SEO Ranking Signals (Authority ${r.estimatedAuthority}/100 · ${r.indexability})`);
      if (r.rankingSignals.length > 0) {
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['Signal', 'Status', 'Impact']],
          body: r.rankingSignals.map(s => [s.signal, s.status.toUpperCase(), s.impact]),
          theme: 'grid',
          headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 9 },
          styles: { fontSize: 8.5, cellPadding: 3, textColor: COLORS.text, overflow: 'linebreak' },
          columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' }, 1: { cellWidth: 22, halign: 'center' } },
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 1) {
              const v = data.cell.raw as string;
              if (v === 'MISSING') data.cell.styles.textColor = COLORS.red;
              else if (v === 'WARNING') data.cell.styles.textColor = COLORS.orange;
              else data.cell.styles.textColor = COLORS.green;
            }
          },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }

      if (r.liveKeywords && r.liveKeywords.length > 0) {
        checkPageBreak(20);
        doc.setTextColor(...COLORS.primary);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Live Google Rankings${r.liveSerpProvider ? ` · ${r.liveSerpProvider}` : ''}`, margin, y);
        y += 4;
        autoTable(doc, {
          startY: y + 2,
          margin: { left: margin, right: margin },
          head: [['Keyword', 'Position', 'Volume', 'Difficulty']],
          body: r.liveKeywords.map(k => [
            k.keyword,
            k.position == null ? 'Not in top 100' : `#${k.position}`,
            k.searchVolume.toLocaleString(),
            String(k.difficulty),
          ]),
          theme: 'grid',
          headStyles: { fillColor: COLORS.accent, textColor: COLORS.white, fontSize: 9 },
          styles: { fontSize: 9, cellPadding: 3, textColor: COLORS.text },
          columnStyles: { 1: { halign: 'center', fontStyle: 'bold' }, 2: { halign: 'center' }, 3: { halign: 'center' } },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }
    }
  }

  // =================== STRATEGIC ROADMAP ===================

  doc.addPage();
  y = 25;
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Strategic Roadmap', margin, y);
  y += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...COLORS.muted);
  doc.text('Sequenced execution plan derived from the SWOT findings.', margin, y + 6);
  y += 14;

  const sortedIssues = [...result.issues].sort((a, b) => {
    const order = ['critical', 'error', 'warning', 'info'];
    return order.indexOf(a.severity) - order.indexOf(b.severity);
  });

  const phases: { title: string; intent: string; filter: AuditIssue['priority']; color: [number, number, number] }[] = [
    { title: 'Phase 1 — Fix Weaknesses (0–30 days)', intent: 'Eliminate critical issues that are actively damaging trust and conversions.', filter: 'high', color: COLORS.red },
    { title: 'Phase 2 — Neutralise Threats (30–60 days)', intent: 'Close competitive gaps and harden security posture.', filter: 'medium', color: COLORS.orange },
    { title: 'Phase 3 — Capture Opportunities (60–90 days)', intent: 'Pursue keywords, content and growth plays that compound on strengths.', filter: 'low', color: COLORS.green },
  ];

  phases.forEach(phase => {
    const phaseIssues = sortedIssues.filter(i => i.priority === phase.filter);
    checkPageBreak(30);

    doc.setFillColor(...phase.color);
    doc.roundedRect(margin, y - 4, 3, 7, 1, 1, 'F');
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(phase.title, margin + 6, y);
    y += 6;

    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(phase.intent, margin + 6, y);
    y += 6;

    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (phaseIssues.length === 0) {
      doc.setTextColor(...COLORS.muted);
      doc.text('•  No items in this phase.', margin + 6, y);
      y += 6;
    } else {
      phaseIssues.forEach(issue => {
        checkPageBreak(8);
        const lines = doc.splitTextToSize(`•  ${issue.title}`, contentWidth - 6);
        doc.text(lines, margin + 6, y);
        y += lines.length * 5;
      });
      const totalGain = phaseIssues.reduce((sum, i) => sum + i.revenueGain, 0);
      if (totalGain > 0) {
        doc.setTextColor(...COLORS.green);
        doc.setFont('helvetica', 'bold');
        doc.text(`Projected impact: +${formatCurrency(totalGain)} / month`, margin + 6, y + 2);
        y += 6;
      }
    }
    y += 6;
  });

  // =================== ROI SUMMARY ===================
  checkPageBreak(80);
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ROI & Conclusion', margin, y);
  y += 9;

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const conclusion = `Acting on this SWOT plan transitions ${result.domain} from a defensive posture to a growth posture. Defending strengths, fixing weaknesses, capturing opportunities and mitigating threats together unlock an estimated ${formatCurrency(annualImpact)} of annual impact.`;
  const conclusionLines = doc.splitTextToSize(conclusion, contentWidth);
  doc.text(conclusionLines, margin, y);
  y += conclusionLines.length * 5 + 6;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    body: [
      ['Monthly Revenue Recovery', formatCurrency(result.totalRevenueLoss)],
      ['Additional Monthly Revenue', formatCurrency(result.potentialRevenueGain)],
      ['Total Monthly Impact', formatCurrency(result.totalRevenueLoss + result.potentialRevenueGain)],
      ['Total Annual Impact', formatCurrency(annualImpact)],
    ],
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 5, textColor: COLORS.text },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { fontStyle: 'bold', halign: 'right', textColor: COLORS.green, fontSize: 12 },
    },
    alternateRowStyles: { fillColor: COLORS.light },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  checkPageBreak(25);
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, y, contentWidth, 18, 3, 3, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Annual Impact: ${formatCurrency(annualImpact)}`, pageWidth / 2, y + 11, { align: 'center' });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(footerLabel, margin, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, pageHeight - 5, pageWidth, 2, 'F');
  }

  doc.save(`swot-audit-${result.domain.replace(/\./g, '-')}.pdf`);
}
