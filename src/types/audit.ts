export interface CompetitorData {
  name: string;
  healthScore: number;
  authorityGap: string;
  contentVolumeGap: string;
  pageSpeedGap: string;
}

export interface KeywordOpportunity {
  keyword: string;
  monthlySearches: number;
  competition: 'Low' | 'Medium' | 'High';
  currentRank: string;
  opportunity: 'Low' | 'Medium' | 'High';
}

export interface GrowthForecastItem {
  area: string;
  action: string;
  seoLift: string;
  conversionLift: string;
}

export interface AdvancedSeoData {
  metaTitle: { value: string; length: number; status: 'good' | 'too_short' | 'too_long' | 'missing' };
  metaDescription: { value: string; length: number; status: 'good' | 'too_short' | 'too_long' | 'missing' };
  headingStructure: { tag: string; text: string }[];
  hasCanonical: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  hasStructuredData: boolean;
  structuredDataTypes: string[];
  imagesWithoutAlt: number;
  totalImages: number;
  internalLinks: number;
  externalLinks: number;
  keywordCloud: { word: string; count: number }[];
}

export interface AuditCategory {
  id: string;
  name: string;
  icon: string;
  score: number;
  maxScore: number;
  issues: AuditIssue[];
}

export interface AuditIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  category: string;
  impact: string;
  recommendation: string;
  revenueLoss: number;
  revenueGain: number;
  priority: 'high' | 'medium' | 'low';
  implemented: boolean;
}

export interface AuditResult {
  url: string;
  domain: string;
  auditDate: string;
  overallScore: number;
  totalRevenueLoss: number;
  potentialRevenueGain: number;
  categories: AuditCategory[];
  issues: AuditIssue[];
  pageSpeed: number;
  mobileScore: number;
  seoScore: number;
  accessibilityScore: number;
  securityScore: number;
  conversionScore: number;
  competitors?: CompetitorData[];
  keywords?: KeywordOpportunity[];
  growthForecast?: GrowthForecastItem[];
  detectedPlatform?: string;
  technologies?: string[];
  advancedSeo?: AdvancedSeoData;
  summary?: string;
  reportId?: string;
}

export type AuditStatus = 'idle' | 'loading' | 'complete' | 'error';
