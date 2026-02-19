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
}

export type AuditStatus = 'idle' | 'loading' | 'complete' | 'error';
