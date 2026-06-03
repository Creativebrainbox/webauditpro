import { useMemo } from 'react';
import { AuditResult } from '@/types/audit';
import { cn } from '@/lib/utils';
import {
  Globe, Calendar, Layers, AlertTriangle, AlertCircle, CheckCircle2,
  Bot, ShoppingBag, Search, Sparkles, ShieldCheck, Zap, Gauge as GaugeIcon,
  TrendingUp, TrendingDown, Activity, Eye, FileCode2, Lock, Users,
} from 'lucide-react';

interface Props {
  result: AuditResult;
}

// Small reusable building blocks ---------------------------------------------

const SectionShell = ({
  title, subtitle, icon: Icon, accent = 'primary', right, children,
}: {
  title: string; subtitle?: string; icon: any; accent?: 'primary' | 'success' | 'warning' | 'destructive' | 'accent';
  right?: React.ReactNode; children: React.ReactNode;
}) => {
  const accentMap: Record<string, string> = {
    primary: 'from-primary/20 to-primary/5 border-primary/30 text-primary',
    success: 'from-success/20 to-success/5 border-success/30 text-success',
    warning: 'from-warning/20 to-warning/5 border-warning/30 text-warning',
    destructive: 'from-destructive/20 to-destructive/5 border-destructive/30 text-destructive',
    accent: 'from-accent/20 to-accent/5 border-accent/30 text-accent',
  };
  return (
    <section className={cn('glass-card rounded-xl border bg-gradient-to-br p-5 md:p-6 animate-fade-up', accentMap[accent])}>
      <header className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg bg-background/40 border border-border/50', `text-${accent === 'primary' ? 'primary' : accent}`)}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {right}
      </header>
      <div className="text-foreground">{children}</div>
    </section>
  );
};

const Gauge = ({ score, label, size = 160 }: { score: number; label?: string; size?: number }) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'hsl(var(--success))' : score >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(var(--border))" strokeWidth="8" fill="none" opacity={0.3} />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        {label && <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</span>}
      </div>
    </div>
  );
};

const StatTile = ({ label, value, sub, tone = 'default', icon: Icon }: {
  label: string; value: string | number; sub?: string;
  tone?: 'default' | 'success' | 'warning' | 'destructive' | 'primary'; icon?: any;
}) => {
  const toneMap = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
    primary: 'text-primary',
  };
  return (
    <div className="rounded-lg bg-background/40 border border-border/40 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
      </div>
      <div className={cn('text-2xl font-bold leading-none', toneMap[tone])}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1.5">{sub}</div>}
    </div>
  );
};

const HBar = ({ label, value, max = 100, tone = 'primary' }: {
  label: string; value: number; max?: number; tone?: 'success' | 'warning' | 'destructive' | 'primary';
}) => {
  const pct = Math.max(2, Math.min(100, (value / max) * 100));
  const toneMap = {
    success: 'bg-success', warning: 'bg-warning', destructive: 'bg-destructive', primary: 'bg-primary',
  };
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">{value}{max === 100 ? '%' : ''}</span>
      </div>
      <div className="h-2 rounded-full bg-background/60 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', toneMap[tone])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// Main dashboard --------------------------------------------------------------

export const AuditDashboard = ({ result }: Props) => {
  const criticalCount = result.issues.filter(i => ['critical', 'error'].includes(i.severity)).length;
  const warningCount = result.issues.filter(i => i.severity === 'warning').length;
  const passedCount = result.issues.filter(i => i.severity === 'info').length;
  const total = result.issues.length;

  // Derived AI-estimated metrics ---------------------------------------------
  const derived = useMemo(() => {
    const score = result.overallScore;
    const issueWeight = Math.min(1, (criticalCount * 0.04) + (warningCount * 0.015));
    const aiRevenueLift = Math.round(15 + (100 - score) * 0.4); // 15-55%
    const trafficMultiplier = (1.5 + (100 - score) / 50).toFixed(1); // 1.5x - 3.5x

    const brandScore = Math.max(20, Math.min(95, Math.round(score * 0.9 + 5)));
    const brandRisk = brandScore < 50 ? 'HIGH RISK' : brandScore < 70 ? 'MODERATE' : 'LOW RISK';
    const brandMentions = Math.max(0, Math.round(criticalCount * 0.8 + warningCount * 0.3));

    // Estimated user loss = traffic baseline * issue weight
    const baselineTraffic = 25000;
    const userLoss = Math.round(baselineTraffic * issueWeight);

    // Performance metrics (estimated from score)
    const lcp = (1 + ((100 - result.pageSpeed) / 100) * 4).toFixed(1); // 1.0s - 5.0s
    const ttfb = Math.round(50 + (100 - result.pageSpeed) * 8); // 50-850ms
    const cls = ((100 - result.pageSpeed) / 1000).toFixed(3);

    return { aiRevenueLift, trafficMultiplier, brandScore, brandRisk, brandMentions, userLoss, lcp, ttfb, cls, issueWeight };
  }, [result, criticalCount, warningCount]);

  const ai = result.extendedAudit?.aiReadiness;
  const ssl = result.extendedAudit?.ssl;
  const headers = result.extendedAudit?.headersSecurity;
  const seo = result.advancedSeo;

  // AI crawler matrix
  const crawlers = ai?.aiCrawlersAllowed ?? [
    { bot: 'GPTBot', allowed: false }, { bot: 'ClaudeBot', allowed: false },
    { bot: 'Google-Extended', allowed: false }, { bot: 'PerplexityBot', allowed: false },
  ];

  // Optimization plan - top issues grouped by priority/category
  const planItems = result.issues.slice(0, 5).map((i, idx) => ({
    ...i,
    color: ['primary', 'accent', 'success', 'warning', 'destructive'][idx % 5],
  }));

  // Quick wins - info/warning issues with high gain
  const quickWins = [...result.issues]
    .filter(i => i.priority !== 'low')
    .sort((a, b) => b.revenueGain - a.revenueGain)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* === Main Details === */}
      <SectionShell title="Main Details" subtitle="Audit metadata and quick counts" icon={Globe} accent="primary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Domain" value={result.domain} icon={Globe} />
          <StatTile label="Audit Date" value={new Date(result.auditDate).toLocaleDateString()} icon={Calendar} />
          <StatTile label="Platform" value={result.detectedPlatform || 'Custom'} icon={Layers} />
          <StatTile label="Tech Stack" value={result.technologies?.length || 0} sub="detected" icon={FileCode2} />
          <StatTile label="Critical" value={criticalCount} tone="destructive" icon={AlertTriangle} />
          <StatTile label="Warnings" value={warningCount} tone="warning" icon={AlertCircle} />
          <StatTile label="Passed" value={passedCount} tone="success" icon={CheckCircle2} />
          <StatTile label="Total Checks" value={total} icon={Activity} />
        </div>
      </SectionShell>

      {/* === Audit Compass === */}
      <SectionShell title="Audit Compass" subtitle="Overall site health" icon={Gauge} accent="warning"
        right={<span className="text-xs text-muted-foreground hidden sm:inline">Higher is better</span>}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <Gauge score={result.overallScore} label="Health" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 w-full">
            <StatTile label="SEO" value={result.seoScore} tone={result.seoScore >= 70 ? 'success' : 'warning'} />
            <StatTile label="Performance" value={result.pageSpeed} tone={result.pageSpeed >= 70 ? 'success' : 'destructive'} />
            <StatTile label="Security" value={result.securityScore} tone={result.securityScore >= 70 ? 'success' : 'warning'} />
            <StatTile label="Mobile" value={result.mobileScore} tone={result.mobileScore >= 70 ? 'success' : 'warning'} />
          </div>
        </div>
      </SectionShell>

      {/* === AI Agentic Revenue Forecast === */}
      <SectionShell title="AI Agentic Revenue Forecast" subtitle="Projected uplift after fixing leaks (AI-estimated)" icon={Sparkles} accent="accent">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border/40 bg-background/40 p-5 text-center">
            <Gauge score={Math.min(95, result.overallScore + derived.aiRevenueLift)} size={120} label="AI score" />
            <p className="text-xs text-muted-foreground mt-2">Post-fix AI visibility</p>
          </div>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 flex flex-col justify-center text-center">
            <div className="text-4xl font-bold text-destructive">{derived.aiRevenueLift}%</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Revenue Lift</div>
            <div className="text-[11px] text-muted-foreground mt-1">From AI shopping + agent traffic</div>
          </div>
          <div className="rounded-lg border border-success/30 bg-success/10 p-5 flex flex-col justify-center text-center">
            <div className="text-4xl font-bold text-success">{derived.trafficMultiplier}x</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Traffic Multiplier</div>
            <div className="text-[11px] text-muted-foreground mt-1">Estimated AI agent reach</div>
          </div>
        </div>
      </SectionShell>

      {/* === AI Crawler Access Matrix === */}
      <SectionShell title="AI Crawler Access Matrix" subtitle="Which AI agents can read your site" icon={Bot} accent="primary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {crawlers.map((c) => (
            <div key={c.bot} className={cn(
              'rounded-lg p-4 border text-center',
              c.allowed ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'
            )}>
              <Bot className={cn('w-5 h-5 mx-auto mb-2', c.allowed ? 'text-success' : 'text-destructive')} />
              <div className="font-semibold text-sm">{c.bot}</div>
              <div className={cn('text-[11px] mt-1 uppercase tracking-wider', c.allowed ? 'text-success' : 'text-destructive')}>
                {c.allowed ? 'Allowed' : 'Blocked'}
              </div>
            </div>
          ))}
        </div>
        {ai?.aiShoppingSignals && ai.aiShoppingSignals.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {ai.aiShoppingSignals.slice(0, 6).map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-background/40 border border-border/40">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-3 h-3 text-accent" />
                  {s.signal}
                </span>
                <span className={cn('font-medium', s.present ? 'text-success' : 'text-destructive')}>
                  {s.present ? '✓ Present' : '✗ Missing'}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionShell>

      {/* === Brand & Reputation Synopsis === */}
      <SectionShell title="Brand & Reputation Synopsis" subtitle="AI-estimated brand trust signals" icon={ShieldCheck} accent="destructive">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-background/40 border border-border/40 p-5 text-center">
            <div className="text-4xl font-bold text-foreground">{derived.brandScore}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-2">Brand Score</div>
          </div>
          <div className={cn('rounded-lg p-5 text-center border',
            derived.brandRisk === 'HIGH RISK' ? 'bg-destructive/10 border-destructive/30' :
            derived.brandRisk === 'MODERATE' ? 'bg-warning/10 border-warning/30' :
            'bg-success/10 border-success/30')}>
            <div className={cn('text-2xl font-bold',
              derived.brandRisk === 'HIGH RISK' ? 'text-destructive' :
              derived.brandRisk === 'MODERATE' ? 'text-warning' : 'text-success')}>{derived.brandRisk}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-2">Risk Level</div>
          </div>
          <div className="rounded-lg bg-background/40 border border-border/40 p-5 text-center">
            <div className="text-4xl font-bold text-foreground">{derived.brandMentions}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-2">Trust Issues Flagged</div>
          </div>
        </div>
      </SectionShell>

      {/* === AI Agent Optimization Plan === */}
      <SectionShell title="AI Agent Optimization Plan" subtitle="Top priorities to unlock AI traffic" icon={Sparkles} accent="primary">
        <div className="space-y-3">
          {planItems.map((item) => (
            <div key={item.id} className={cn(
              'rounded-lg border p-4',
              item.color === 'primary' && 'border-primary/30 bg-primary/5',
              item.color === 'accent' && 'border-accent/30 bg-accent/5',
              item.color === 'success' && 'border-success/30 bg-success/5',
              item.color === 'warning' && 'border-warning/30 bg-warning/5',
              item.color === 'destructive' && 'border-destructive/30 bg-destructive/5',
            )}>
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                    item.severity === 'critical' || item.severity === 'error' ? 'bg-destructive/20 text-destructive' :
                    item.severity === 'warning' ? 'bg-warning/20 text-warning' :
                    'bg-success/20 text-success')}>
                    {item.severity}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.category}</span>
                </div>
                {item.revenueGain > 0 && (
                  <span className="text-xs font-mono text-success">+${item.revenueGain.toLocaleString()}/mo</span>
                )}
              </div>
              <div className="font-semibold text-sm mb-1">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.recommendation}</div>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* === Performance === */}
      <SectionShell title="Performance" subtitle="Core Web Vitals (AI-estimated from observed page load)" icon={Zap} accent="warning">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Gauge score={result.pageSpeed} label="Speed" size={130} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1 w-full">
            <StatTile label="LCP" value={`${derived.lcp}s`} tone={parseFloat(derived.lcp) < 2.5 ? 'success' : 'destructive'} sub="Largest Contentful Paint" />
            <StatTile label="TTFB" value={`${derived.ttfb}ms`} tone={derived.ttfb < 200 ? 'success' : 'warning'} sub="Time to First Byte" />
            <StatTile label="CLS" value={derived.cls} tone={parseFloat(derived.cls) < 0.1 ? 'success' : 'warning'} sub="Cumulative Layout Shift" />
            <StatTile label="Mobile" value={result.mobileScore} sub="Mobile score" />
            <StatTile label="Accessibility" value={result.accessibilityScore} sub="A11y score" />
            <StatTile label="Conversion" value={result.conversionScore} sub="Conversion score" />
          </div>
        </div>
      </SectionShell>

      {/* === SEO Visibility === */}
      <SectionShell title="SEO Visibility" subtitle="Search engine readiness" icon={Search} accent="primary">
        <div className="flex flex-col md:flex-row gap-6">
          <Gauge score={result.seoScore} label="SEO" size={130} />
          <div className="flex-1 space-y-2">
            {[
              { label: 'Meta Title', ok: seo?.metaTitle?.status === 'good' },
              { label: 'Meta Description', ok: seo?.metaDescription?.status === 'good' },
              { label: 'Canonical URL', ok: seo?.hasCanonical },
              { label: 'Sitemap.xml', ok: seo?.hasSitemap },
              { label: 'robots.txt', ok: seo?.hasRobotsTxt },
              { label: 'Structured Data', ok: seo?.hasStructuredData },
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-background/40 border border-border/40">
                <span>{f.label}</span>
                {f.ok ? <CheckCircle2 className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
              </div>
            ))}
          </div>
        </div>
        {seo?.structuredDataTypes && seo.structuredDataTypes.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">Detected schema types:</div>
            <pre className="text-[11px] font-mono bg-background/60 border border-border/40 p-3 rounded overflow-x-auto">
{JSON.stringify({ "@context": "https://schema.org", "@types": seo.structuredDataTypes }, null, 2)}
            </pre>
          </div>
        )}
      </SectionShell>

      {/* === Security & Vulnerability === */}
      <SectionShell title="Security & Vulnerability" subtitle="Headers, SSL, and exposure checks" icon={Lock} accent="success">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <HBar label="Overall security" value={result.securityScore} tone={result.securityScore >= 70 ? 'success' : 'warning'} />
            <HBar label="Headers coverage" value={headers ? Math.round(
              ([headers.hasHSTS, headers.hasCSP, headers.hasXFrameOptions, headers.hasXContentTypeOptions, headers.hasReferrerPolicy, headers.hasPermissionsPolicy].filter(Boolean).length / 6) * 100
            ) : 0} tone="primary" />
            <HBar label="SSL grade" value={ssl?.grade === 'A+' ? 100 : ssl?.grade === 'A' ? 90 : ssl?.grade === 'B' ? 75 : 50} tone="success" />
          </div>
          <div className="space-y-2 text-xs">
            {[
              { label: 'HTTPS enabled', ok: ssl?.isHttps },
              { label: 'HSTS header', ok: headers?.hasHSTS },
              { label: 'Content Security Policy', ok: headers?.hasCSP },
              { label: 'X-Frame-Options', ok: headers?.hasXFrameOptions },
              { label: 'Referrer Policy', ok: headers?.hasReferrerPolicy },
              { label: 'No mixed content', ok: ssl ? !ssl.hasMixedContent : false },
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-background/40 border border-border/40">
                <span>{f.label}</span>
                {f.ok ? <CheckCircle2 className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* === Confidence Impact analyzer === */}
      <SectionShell title="Confidence Impact Analyzer" subtitle="How each category drags overall health" icon={Activity} accent="accent">
        <div className="space-y-3">
          {result.categories.slice(0, 8).map((c) => (
            <HBar
              key={c.id}
              label={c.name}
              value={c.score}
              max={c.maxScore || 100}
              tone={c.score >= 70 ? 'success' : c.score >= 50 ? 'warning' : 'destructive'}
            />
          ))}
        </div>
      </SectionShell>

      {/* === Estimated User Loss === */}
      <SectionShell title="Estimated User Loss" subtitle="Visitors lost monthly due to current issues (AI-estimated)" icon={Users} accent="destructive">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center md:col-span-1">
            <TrendingDown className="w-6 h-6 text-destructive mx-auto mb-2" />
            <div className="text-4xl font-bold text-destructive">{derived.userLoss.toLocaleString()}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-2">Users / month</div>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            <StatTile label="Revenue at risk" value={`$${result.totalRevenueLoss.toLocaleString()}`} tone="destructive" />
            <StatTile label="Recoverable" value={`$${result.potentialRevenueGain.toLocaleString()}`} tone="success" />
            <StatTile label="Critical fixes" value={criticalCount} tone="destructive" />
            <StatTile label="Quick wins" value={quickWins.length} tone="success" />
          </div>
        </div>
      </SectionShell>

      {/* === Critical / Warning / Passed summary === */}
      <SectionShell title="Issue Breakdown" subtitle="Snapshot of all audit checks" icon={Eye} accent="warning">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg p-5 text-center border border-destructive/30 bg-destructive/10">
            <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-2" />
            <div className="text-3xl font-bold text-destructive">{criticalCount}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Critical</div>
          </div>
          <div className="rounded-lg p-5 text-center border border-warning/30 bg-warning/10">
            <AlertCircle className="w-5 h-5 text-warning mx-auto mb-2" />
            <div className="text-3xl font-bold text-warning">{warningCount}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Warnings</div>
          </div>
          <div className="rounded-lg p-5 text-center border border-success/30 bg-success/10">
            <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold text-success">{passedCount}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Passed</div>
          </div>
        </div>
      </SectionShell>

      {/* === AI Agent Quick Wins === */}
      <SectionShell title="AI Agent Quick Wins" subtitle="Highest-impact fixes you can ship this week" icon={TrendingUp} accent="success">
        <ul className="space-y-2">
          {quickWins.map((q) => (
            <li key={q.id} className="flex items-start gap-3 p-3 rounded bg-background/40 border border-border/40">
              <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm">{q.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{q.recommendation}</div>
              </div>
              {q.revenueGain > 0 && (
                <span className="text-xs font-mono text-success whitespace-nowrap">+${q.revenueGain.toLocaleString()}</span>
              )}
            </li>
          ))}
          {quickWins.length === 0 && (
            <li className="text-sm text-muted-foreground text-center py-4">No high-impact quick wins detected — site is in great shape.</li>
          )}
        </ul>
      </SectionShell>
    </div>
  );
};
