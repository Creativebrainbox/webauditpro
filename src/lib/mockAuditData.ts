import { AuditResult, AuditIssue, AuditCategory } from '@/types/audit';

const generateIssues = (url: string): AuditIssue[] => {
  const baseRevenue = Math.floor(Math.random() * 50000) + 10000;
  
  return [
    {
      id: '1',
      title: 'Page Load Time Exceeds 3 Seconds',
      description: 'Your website takes over 3 seconds to fully load, causing significant visitor abandonment. Studies show 53% of mobile users abandon sites that take longer than 3 seconds.',
      severity: 'critical',
      category: 'Performance',
      impact: 'High visitor abandonment rate, reduced conversions, poor SEO rankings',
      recommendation: 'Implement lazy loading for images, enable browser caching, minify CSS/JS files, and consider a CDN for faster content delivery.',
      revenueLoss: Math.floor(baseRevenue * 0.20),
      revenueGain: Math.floor(baseRevenue * 0.25),
      priority: 'high',
      implemented: false,
    },
    {
      id: '2',
      title: 'Missing Meta Descriptions',
      description: 'Multiple pages lack meta descriptions, reducing click-through rates from search results by up to 30%.',
      severity: 'error',
      category: 'SEO',
      impact: 'Lower search visibility, reduced organic traffic, poor SERP presentation',
      recommendation: 'Add unique, compelling meta descriptions (150-160 characters) to all pages, including target keywords naturally.',
      revenueLoss: Math.floor(baseRevenue * 0.08),
      revenueGain: Math.floor(baseRevenue * 0.12),
      priority: 'high',
      implemented: false,
    },
    {
      id: '3',
      title: 'No SSL Certificate Detected',
      description: 'Your website is not secured with HTTPS. Browsers display security warnings, causing immediate visitor distrust.',
      severity: 'critical',
      category: 'Security',
      impact: 'Lost customer trust, browser warnings, Google ranking penalty',
      recommendation: 'Install an SSL certificate immediately. Many hosting providers offer free SSL through Let\'s Encrypt.',
      revenueLoss: Math.floor(baseRevenue * 0.35),
      revenueGain: Math.floor(baseRevenue * 0.40),
      priority: 'high',
      implemented: false,
    },
    {
      id: '4',
      title: 'Poor Mobile Responsiveness',
      description: 'Touch targets are too small and content doesn\'t scale properly on mobile devices. With 60%+ traffic from mobile, this is critical.',
      severity: 'critical',
      category: 'Mobile',
      impact: 'Lost mobile conversions, poor user experience, mobile SEO penalty',
      recommendation: 'Implement responsive design with touch targets of at least 44x44 pixels. Test on multiple device sizes.',
      revenueLoss: Math.floor(baseRevenue * 0.25),
      revenueGain: Math.floor(baseRevenue * 0.30),
      priority: 'high',
      implemented: false,
    },
    {
      id: '5',
      title: 'Missing Alt Text on Images',
      description: '12 images are missing alt text, impacting accessibility and image SEO.',
      severity: 'warning',
      category: 'Accessibility',
      impact: 'Reduced accessibility, lost image search traffic, ADA compliance risk',
      recommendation: 'Add descriptive alt text to all images. Be concise but descriptive of the image content and context.',
      revenueLoss: Math.floor(baseRevenue * 0.03),
      revenueGain: Math.floor(baseRevenue * 0.05),
      priority: 'medium',
      implemented: false,
    },
    {
      id: '6',
      title: 'No Clear Call-to-Action Above Fold',
      description: 'Primary conversion actions are not visible without scrolling, reducing immediate engagement.',
      severity: 'error',
      category: 'Conversion',
      impact: 'Reduced conversion rates, unclear user journey, lost immediate opportunities',
      recommendation: 'Place a prominent, contrasting CTA button above the fold with action-oriented text.',
      revenueLoss: Math.floor(baseRevenue * 0.15),
      revenueGain: Math.floor(baseRevenue * 0.22),
      priority: 'high',
      implemented: false,
    },
    {
      id: '7',
      title: 'Missing Structured Data (Schema.org)',
      description: 'No structured data markup detected. Rich snippets could increase CTR by 20-30%.',
      severity: 'warning',
      category: 'SEO',
      impact: 'Missing rich snippets in search, lost visibility, lower CTR',
      recommendation: 'Implement JSON-LD structured data for your content type (LocalBusiness, Product, Article, etc.).',
      revenueLoss: Math.floor(baseRevenue * 0.06),
      revenueGain: Math.floor(baseRevenue * 0.10),
      priority: 'medium',
      implemented: false,
    },
    {
      id: '8',
      title: 'Cumulative Layout Shift (CLS) Issues',
      description: 'Page elements shift during loading, causing accidental clicks and frustrating users.',
      severity: 'error',
      category: 'Performance',
      impact: 'Poor user experience, accidental clicks, Core Web Vitals failure',
      recommendation: 'Set explicit dimensions for images and embeds. Use CSS aspect-ratio or min-height for dynamic content.',
      revenueLoss: Math.floor(baseRevenue * 0.08),
      revenueGain: Math.floor(baseRevenue * 0.10),
      priority: 'high',
      implemented: false,
    },
    {
      id: '9',
      title: 'No Trust Signals Present',
      description: 'Missing testimonials, reviews, security badges, or certifications that build visitor confidence.',
      severity: 'warning',
      category: 'Conversion',
      impact: 'Reduced trust, lower conversion rates, cart abandonment',
      recommendation: 'Add customer testimonials, trust badges, secure payment icons, and any relevant certifications.',
      revenueLoss: Math.floor(baseRevenue * 0.12),
      revenueGain: Math.floor(baseRevenue * 0.18),
      priority: 'medium',
      implemented: false,
    },
    {
      id: '10',
      title: 'Missing Robots.txt File',
      description: 'No robots.txt file found, potentially allowing search engines to crawl sensitive areas.',
      severity: 'info',
      category: 'SEO',
      impact: 'Potential indexing of unwanted pages, wasted crawl budget',
      recommendation: 'Create a robots.txt file to guide search engine crawlers and protect sensitive directories.',
      revenueLoss: Math.floor(baseRevenue * 0.02),
      revenueGain: Math.floor(baseRevenue * 0.03),
      priority: 'low',
      implemented: false,
    },
    {
      id: '11',
      title: 'Forms Lack Validation Feedback',
      description: 'Contact and signup forms don\'t provide clear error messages, causing form abandonment.',
      severity: 'warning',
      category: 'UX',
      impact: 'Form abandonment, lost leads, user frustration',
      recommendation: 'Implement inline validation with clear, helpful error messages. Show success states clearly.',
      revenueLoss: Math.floor(baseRevenue * 0.07),
      revenueGain: Math.floor(baseRevenue * 0.09),
      priority: 'medium',
      implemented: false,
    },
    {
      id: '12',
      title: 'Missing Favicon',
      description: 'No favicon detected, making your site look unprofessional in browser tabs.',
      severity: 'info',
      category: 'Branding',
      impact: 'Reduced brand recognition, unprofessional appearance',
      recommendation: 'Add a high-quality favicon in multiple sizes (16x16, 32x32, 180x180 for Apple devices).',
      revenueLoss: Math.floor(baseRevenue * 0.01),
      revenueGain: Math.floor(baseRevenue * 0.02),
      priority: 'low',
      implemented: false,
    },
  ];
};

const generateCategories = (issues: AuditIssue[]): AuditCategory[] => {
  const categoryMap: Record<string, { issues: AuditIssue[]; icon: string }> = {
    Performance: { issues: [], icon: 'Zap' },
    SEO: { issues: [], icon: 'Search' },
    Security: { issues: [], icon: 'Shield' },
    Mobile: { issues: [], icon: 'Smartphone' },
    Accessibility: { issues: [], icon: 'Eye' },
    Conversion: { issues: [], icon: 'TrendingUp' },
    UX: { issues: [], icon: 'MousePointer' },
    Branding: { issues: [], icon: 'Palette' },
  };

  issues.forEach(issue => {
    if (categoryMap[issue.category]) {
      categoryMap[issue.category].issues.push(issue);
    }
  });

  return Object.entries(categoryMap).map(([name, data]) => {
    const maxScore = 100;
    const deductions = data.issues.reduce((acc, issue) => {
      switch (issue.severity) {
        case 'critical': return acc + 30;
        case 'error': return acc + 15;
        case 'warning': return acc + 8;
        case 'info': return acc + 3;
        default: return acc;
      }
    }, 0);
    
    return {
      id: name.toLowerCase(),
      name,
      icon: data.icon,
      score: Math.max(0, maxScore - deductions),
      maxScore,
      issues: data.issues,
    };
  }).filter(cat => cat.issues.length > 0);
};

export const generateAuditResult = (url: string): AuditResult => {
  const issues = generateIssues(url);
  const categories = generateCategories(issues);
  
  const totalRevenueLoss = issues.reduce((acc, issue) => acc + issue.revenueLoss, 0);
  const potentialRevenueGain = issues.reduce((acc, issue) => acc + issue.revenueGain, 0);
  
  const avgScore = categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length;
  
  let domain = url;
  try {
    domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {
    domain = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }

  return {
    url,
    domain,
    auditDate: new Date().toISOString(),
    overallScore: Math.round(avgScore),
    totalRevenueLoss,
    potentialRevenueGain,
    categories,
    issues,
    pageSpeed: Math.round(categories.find(c => c.name === 'Performance')?.score || 65),
    mobileScore: Math.round(categories.find(c => c.name === 'Mobile')?.score || 55),
    seoScore: Math.round(categories.find(c => c.name === 'SEO')?.score || 72),
    accessibilityScore: Math.round(categories.find(c => c.name === 'Accessibility')?.score || 82),
    securityScore: Math.round(categories.find(c => c.name === 'Security')?.score || 35),
    conversionScore: Math.round(categories.find(c => c.name === 'Conversion')?.score || 58),
  };
};
