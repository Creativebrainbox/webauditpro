import { ExtendedAuditData } from '@/types/audit';
import { cn } from '@/lib/utils';
import { 
  Shield, CheckCircle2, XCircle, AlertTriangle, Globe, Mail, 
  Lock, FileWarning, Share2, Link2, Scale, Image as ImageIcon
} from 'lucide-react';

interface ExtendedAuditSectionProps {
  data: ExtendedAuditData;
  activeSection: string;
}

const StatusBadge = ({ ok, label }: { ok: boolean; label: string }) => (
  <div className={cn(
    'flex items-center gap-2 p-3 rounded-lg border',
    ok ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'
  )}>
    {ok ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> : <XCircle className="w-4 h-4 text-destructive shrink-0" />}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const SectionWrapper = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="glass-card rounded-xl border border-border/50 p-6 space-y-4 animate-fade-up">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2.5 rounded-lg bg-primary/20 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    {children}
  </div>
);

export const ExtendedAuditSection = ({ data, activeSection }: ExtendedAuditSectionProps) => {
  if (activeSection === 'headers' && data.headersSecurity) {
    const hs = data.headersSecurity;
    const passed = hs.headers.filter(h => h.status === 'good').length;
    const total = hs.headers.length;
    return (
      <SectionWrapper title="Headers Security" icon={Shield}>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground font-bold">{passed}/{total}</span> security headers configured
          </div>
          {hs.serverHeader && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
              Server: {hs.serverHeader}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hs.headers.map((h, i) => (
            <div key={i} className={cn(
              'p-3 rounded-lg border',
              h.status === 'good' ? 'bg-success/5 border-success/20' :
              h.status === 'warning' ? 'bg-warning/5 border-warning/20' :
              'bg-destructive/5 border-destructive/20'
            )}>
              <div className="flex items-center gap-2 mb-1">
                {h.status === 'good' ? <CheckCircle2 className="w-4 h-4 text-success" /> :
                 h.status === 'warning' ? <AlertTriangle className="w-4 h-4 text-warning" /> :
                 <XCircle className="w-4 h-4 text-destructive" />}
                <span className="text-sm font-medium">{h.name}</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6 truncate">{h.value}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>
    );
  }

  if (activeSection === 'ssl' && data.ssl) {
    const ssl = data.ssl;
    return (
      <SectionWrapper title="SSL / HTTPS" icon={Lock}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatusBadge ok={ssl.isHttps} label="HTTPS Enabled" />
          <StatusBadge ok={!ssl.hasMixedContent} label="No Mixed Content" />
          <StatusBadge ok={ssl.grade === 'A' || ssl.grade === 'A+'} label={`Grade: ${ssl.grade}`} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-sm text-muted-foreground">Protocol</span>
            <p className="font-semibold">{ssl.protocol || 'N/A'}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-sm text-muted-foreground">Issuer</span>
            <p className="font-semibold truncate">{ssl.issuer || 'N/A'}</p>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  if (activeSection === 'dns' && data.dns) {
    const dns = data.dns;
    return (
      <SectionWrapper title="DNS Configuration" icon={Globe}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatusBadge ok={dns.hasARecord} label="A Record" />
          <StatusBadge ok={dns.hasMXRecord} label="MX Record" />
          <StatusBadge ok={dns.hasTXTRecord} label="TXT Record" />
        </div>
        {dns.dnsProvider !== 'Unknown' && (
          <p className="text-sm text-muted-foreground mt-2">
            DNS Provider: <span className="text-foreground font-medium">{dns.dnsProvider}</span>
          </p>
        )}
        {dns.records.length > 0 && (
          <div className="space-y-2 mt-4">
            {dns.records.map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">{r.type}</span>
                <span className="text-sm truncate">{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>
    );
  }

  if (activeSection === 'email' && data.emailSecurity) {
    const email = data.emailSecurity;
    return (
      <SectionWrapper title="Email Security" icon={Mail}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatusBadge ok={email.hasSPF} label="SPF Record" />
          <StatusBadge ok={email.hasDKIM} label="DKIM Record" />
          <StatusBadge ok={email.hasDMARC} label="DMARC Record" />
        </div>
        {email.exposedEmails.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-semibold text-warning">Exposed Email Addresses</span>
            </div>
            <div className="space-y-1">
              {email.exposedEmails.map((e, i) => (
                <p key={i} className="text-sm font-mono text-muted-foreground">{e}</p>
              ))}
            </div>
          </div>
        )}
        {email.exposedEmails.length === 0 && (
          <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">No plaintext emails exposed</span>
            </div>
          </div>
        )}
      </SectionWrapper>
    );
  }

  if (activeSection === 'safebrowsing' && data.safeBrowsing) {
    const sb = data.safeBrowsing;
    return (
      <SectionWrapper title="Safe Browsing" icon={Shield}>
        <div className={cn(
          'p-6 rounded-lg border text-center',
          sb.isSafe ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'
        )}>
          {sb.isSafe ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <h4 className="font-semibold text-lg text-success">Website is Safe</h4>
              <p className="text-sm text-muted-foreground">No threats detected</p>
            </>
          ) : (
            <>
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-3" />
              <h4 className="font-semibold text-lg text-destructive">Threats Detected</h4>
              <div className="mt-2 space-y-1">
                {sb.threats.map((t, i) => <p key={i} className="text-sm text-destructive">{t}</p>)}
              </div>
            </>
          )}
        </div>
      </SectionWrapper>
    );
  }

  if (activeSection === 'favicon' && data.favicon) {
    const fav = data.favicon;
    return (
      <SectionWrapper title="Favicon & App Icons" icon={ImageIcon}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatusBadge ok={fav.hasFavicon} label="Favicon" />
          <StatusBadge ok={fav.hasAppleTouchIcon} label="Apple Touch Icon" />
          <StatusBadge ok={fav.hasManifest} label="Web App Manifest" />
        </div>
        {fav.faviconUrl && (
          <p className="text-sm text-muted-foreground mt-2">
            Favicon URL: <span className="font-mono text-xs">{fav.faviconUrl}</span>
          </p>
        )}
      </SectionWrapper>
    );
  }

  if (activeSection === 'legal' && data.legalCompliance) {
    const legal = data.legalCompliance;
    return (
      <SectionWrapper title="Legal Compliance" icon={Scale}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <StatusBadge ok={legal.hasPrivacyPolicy} label="Privacy Policy" />
          <StatusBadge ok={legal.hasTermsOfService} label="Terms of Service" />
          <StatusBadge ok={legal.hasCookieConsent} label="Cookie Consent" />
          <StatusBadge ok={legal.hasGDPRCompliance} label="GDPR Compliance" />
          <StatusBadge ok={legal.hasCCPA} label="CCPA Compliance" />
        </div>
        {legal.detectedLinks.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Detected Legal Pages</h4>
            {legal.detectedLinks.map((l, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{l.type}</span>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary truncate hover:underline">{l.url}</a>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>
    );
  }

  if (activeSection === 'opengraph' && data.openGraph) {
    const og = data.openGraph;
    const passed = og.tags.filter(t => t.status === 'good').length;
    return (
      <SectionWrapper title="Open Graph & Social" icon={Share2}>
        <p className="text-sm text-muted-foreground mb-4">
          <span className="text-foreground font-bold">{passed}/{og.tags.length}</span> social sharing tags configured
        </p>
        <div className="space-y-2">
          {og.tags.map((tag, i) => (
            <div key={i} className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              tag.status === 'good' ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'
            )}>
              {tag.status === 'good' ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> : <XCircle className="w-4 h-4 text-destructive shrink-0" />}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{tag.property}</span>
                {tag.content && <p className="text-xs text-muted-foreground truncate">{tag.content}</p>}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>
    );
  }

  if (activeSection === 'brokenlinks' && data.brokenLinks) {
    const bl = data.brokenLinks;
    return (
      <SectionWrapper title="Broken Links" icon={Link2}>
        <div className={cn(
          'p-4 rounded-lg border mb-4',
          bl.brokenCount === 0 ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'
        )}>
          <div className="flex items-center gap-3">
            {bl.brokenCount === 0 ? <CheckCircle2 className="w-5 h-5 text-success" /> : <FileWarning className="w-5 h-5 text-destructive" />}
            <div>
              <p className="font-semibold">
                {bl.brokenCount === 0 ? 'No broken links found' : `${bl.brokenCount} broken link${bl.brokenCount !== 1 ? 's' : ''} found`}
              </p>
              <p className="text-sm text-muted-foreground">Checked {bl.totalChecked} links</p>
            </div>
          </div>
        </div>
        {bl.brokenLinks.length > 0 && (
          <div className="space-y-2">
            {bl.brokenLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-destructive/20 text-destructive">
                  {link.statusCode || 'ERR'}
                </span>
                <span className="text-sm truncate">{link.url}</span>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>
    );
  }

  return null;
};
