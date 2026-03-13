import { cn } from '@/lib/utils';
import { 
  BarChart3, Shield, Globe, Mail, Zap, Lock, FileWarning, 
  Share2, Link2, Scale, Image, Search, Eye, Smartphone, 
  TrendingUp, AlertTriangle, CheckCircle2, FileText, Activity,
  FileSearch, Map, Users, Target, BarChart
} from 'lucide-react';
import { ExtendedAuditData } from '@/types/audit';

export interface ReportNavItem {
  id: string;
  label: string;
  icon: any;
  status?: 'good' | 'warning' | 'error';
}

interface ReportNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  extendedAudit?: ExtendedAuditData;
  hasCompetitors?: boolean;
  hasKeywords?: boolean;
  hasGrowth?: boolean;
}

function getNavItems(ext?: ExtendedAuditData, hasCompetitors?: boolean, hasKeywords?: boolean, hasGrowth?: boolean): ReportNavItem[] {
  const items: ReportNavItem[] = [
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'contentquality', label: 'Content Quality', icon: FileText, status: getContentQualityStatus(ext) },
    { id: 'headers', label: 'Headers Security', icon: Shield, status: getHeadersStatus(ext) },
    { id: 'dns', label: 'DNS', icon: Globe, status: getDnsStatus(ext) },
    { id: 'email', label: 'Email', icon: Mail, status: getEmailStatus(ext) },
    { id: 'ssl', label: 'SSL / HTTPS', icon: Lock, status: getSslStatus(ext) },
    { id: 'safebrowsing', label: 'Safe Browsing', icon: Shield, status: getSafeBrowsingStatus(ext) },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'tracking', label: 'Tracking Tools', icon: Activity, status: getTrackingStatus(ext) },
    { id: 'robotstxt', label: 'Robots.txt', icon: FileSearch, status: getRobotsTxtStatus(ext) },
    { id: 'sitemap', label: 'Sitemap', icon: Map, status: getSitemapStatus(ext) },
    { id: 'opengraph', label: 'Open Graph', icon: Share2, status: getOgStatus(ext) },
    { id: 'favicon', label: 'Favicon', icon: Image, status: getFaviconStatus(ext) },
    { id: 'legal', label: 'Legal', icon: Scale, status: getLegalStatus(ext) },
    { id: 'brokenlinks', label: 'Broken Links', icon: Link2, status: getBrokenLinksStatus(ext) },
  ];
  if (hasCompetitors) items.push({ id: 'competitors', label: 'Competitors', icon: Users });
  if (hasKeywords) items.push({ id: 'keywords', label: 'Keywords', icon: Target });
  if (hasGrowth) items.push({ id: 'growth', label: 'Growth Forecast', icon: TrendingUp });
  items.push({ id: 'issues', label: 'All Issues', icon: AlertTriangle });
  return items;
}

function getHeadersStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.headersSecurity) return 'warning';
  const h = ext.headersSecurity;
  const passed = [h.hasHSTS, h.hasCSP, h.hasXFrameOptions, h.hasXContentTypeOptions].filter(Boolean).length;
  if (passed >= 3) return 'good';
  if (passed >= 1) return 'warning';
  return 'error';
}

function getDnsStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.dns) return 'warning';
  return ext.dns.hasARecord ? 'good' : 'error';
}

function getEmailStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.emailSecurity) return 'warning';
  const e = ext.emailSecurity;
  if (e.exposedEmails.length > 0) return 'error';
  if (e.hasSPF && e.hasDMARC) return 'good';
  return 'warning';
}

function getSslStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.ssl) return 'warning';
  if (!ext.ssl.isHttps) return 'error';
  if (ext.ssl.hasMixedContent) return 'warning';
  return 'good';
}

function getSafeBrowsingStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.safeBrowsing) return 'warning';
  return ext.safeBrowsing.isSafe ? 'good' : 'error';
}

function getOgStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.openGraph) return 'warning';
  const og = ext.openGraph;
  const core = [og.hasOgTitle, og.hasOgDescription, og.hasOgImage].filter(Boolean).length;
  if (core >= 3) return 'good';
  if (core >= 1) return 'warning';
  return 'error';
}

function getFaviconStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.favicon) return 'warning';
  return ext.favicon.hasFavicon ? 'good' : 'error';
}

function getLegalStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.legalCompliance) return 'warning';
  const l = ext.legalCompliance;
  const count = [l.hasPrivacyPolicy, l.hasTermsOfService, l.hasCookieConsent].filter(Boolean).length;
  if (count >= 3) return 'good';
  if (count >= 1) return 'warning';
  return 'error';
}

function getContentQualityStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.contentQuality) return 'warning';
  if (ext.contentQuality.contentToCodeRatio >= 15 && ext.contentQuality.readabilityScore >= 50) return 'good';
  if (ext.contentQuality.contentToCodeRatio >= 5) return 'warning';
  return 'error';
}

function getTrackingStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.trackingTools) return 'warning';
  const detected = ext.trackingTools.tools.filter(t => t.status === 'detected').length;
  if (detected >= 2) return 'good';
  if (detected >= 1) return 'warning';
  return 'error';
}

function getRobotsTxtStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.robotsTxt) return 'warning';
  return ext.robotsTxt.exists ? 'good' : 'error';
}

function getSitemapStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.sitemap) return 'warning';
  return ext.sitemap.exists ? 'good' : 'error';
}

function getBrokenLinksStatus(ext?: ExtendedAuditData): 'good' | 'warning' | 'error' {
  if (!ext?.brokenLinks) return 'warning';
  if (ext.brokenLinks.brokenCount === 0) return 'good';
  if (ext.brokenLinks.brokenCount <= 3) return 'warning';
  return 'error';
}

const statusColors = {
  good: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
};

const statusDotColors = {
  good: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
};

export const ReportNavigation = ({ activeSection, onSectionChange, extendedAudit, hasCompetitors, hasKeywords, hasGrowth }: ReportNavigationProps) => {
  const items = getNavItems(extendedAudit, hasCompetitors, hasKeywords, hasGrowth);

  return (
    <div className="glass-card rounded-xl border border-border/50 p-2 mb-6 overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
              {item.status && !isActive && (
                <span className={cn('w-2 h-2 rounded-full', statusDotColors[item.status])} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
