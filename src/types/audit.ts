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

export interface HeadersSecurityData {
  hasHSTS: boolean;
  hasCSP: boolean;
  hasXFrameOptions: boolean;
  hasXContentTypeOptions: boolean;
  hasReferrerPolicy: boolean;
  hasPermissionsPolicy: boolean;
  serverHeader: string;
  headers: { name: string; value: string; status: 'good' | 'warning' | 'missing' }[];
}

export interface DnsData {
  hasARecord: boolean;
  hasMXRecord: boolean;
  hasTXTRecord: boolean;
  dnsProvider: string;
  nameservers: string[];
  records: { type: string; value: string; status: 'good' | 'warning' | 'missing' }[];
}

export interface EmailSecurityData {
  hasSPF: boolean;
  hasDKIM: boolean;
  hasDMARC: boolean;
  exposedEmails: string[];
  records: { type: string; value: string; status: 'good' | 'warning' | 'missing' }[];
}

export interface SslData {
  isHttps: boolean;
  issuer: string;
  validFrom: string;
  validTo: string;
  protocol: string;
  grade: string;
  daysUntilExpiry: number;
  hasMixedContent: boolean;
}

export interface SafeBrowsingData {
  isSafe: boolean;
  threats: string[];
}

export interface FaviconData {
  hasFavicon: boolean;
  hasAppleTouchIcon: boolean;
  hasManifest: boolean;
  faviconUrl: string;
}

export interface LegalComplianceData {
  hasPrivacyPolicy: boolean;
  hasTermsOfService: boolean;
  hasCookieConsent: boolean;
  hasGDPRCompliance: boolean;
  hasCCPA: boolean;
  detectedLinks: { type: string; url: string }[];
}

export interface OpenGraphData {
  hasOgTitle: boolean;
  hasOgDescription: boolean;
  hasOgImage: boolean;
  hasOgUrl: boolean;
  hasTwitterCard: boolean;
  tags: { property: string; content: string; status: 'good' | 'missing' }[];
}

export interface BrokenLinksData {
  totalChecked: number;
  brokenCount: number;
  brokenLinks: { url: string; statusCode: number; location: string }[];
}

export interface TrackingToolsData {
  tools: { name: string; category: string; status: 'detected' | 'not_detected' }[];
}

export interface ContentQualityData {
  wordCount: number;
  readabilityScore: number;
  readabilityGrade: string;
  paragraphCount: number;
  averageSentenceLength: number;
  contentToCodeRatio: number;
}

export interface RobotsTxtData {
  exists: boolean;
  content: string;
  disallowedPaths: string[];
  allowedPaths: string[];
  sitemapReferences: string[];
}

export interface SitemapData {
  exists: boolean;
  url: string;
  urlCount: number;
  format: string;
}

export interface ExtendedAuditData {
  headersSecurity?: HeadersSecurityData;
  dns?: DnsData;
  emailSecurity?: EmailSecurityData;
  ssl?: SslData;
  safeBrowsing?: SafeBrowsingData;
  favicon?: FaviconData;
  legalCompliance?: LegalComplianceData;
  openGraph?: OpenGraphData;
  brokenLinks?: BrokenLinksData;
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
  extendedAudit?: ExtendedAuditData;
  summary?: string;
  reportId?: string;
}

export type AuditStatus = 'idle' | 'loading' | 'complete' | 'error';
