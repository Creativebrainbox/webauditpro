import { useState } from 'react';
import { AdvancedSeoData } from '@/types/audit';
import { cn } from '@/lib/utils';
import { 
  Search, FileText, Link2, Image, Code, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

interface AdvancedSeoSectionProps {
  seo: AdvancedSeoData;
}

const StatusIcon = ({ ok }: { ok: boolean }) => ok 
  ? <CheckCircle2 className="w-4 h-4 text-success" /> 
  : <XCircle className="w-4 h-4 text-destructive" />;

const MetaStatus = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; color: string }> = {
    good: { label: 'Good', color: 'text-success' },
    too_short: { label: 'Too Short', color: 'text-warning' },
    too_long: { label: 'Too Long', color: 'text-warning' },
    missing: { label: 'Missing', color: 'text-destructive' },
  };
  const c = config[status] || config.missing;
  return <span className={cn('text-xs font-semibold', c.color)}>{c.label}</span>;
};

export const AdvancedSeoSection = ({ seo }: AdvancedSeoSectionProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card rounded-xl border border-border/50 overflow-hidden opacity-0 animate-fade-up stagger-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/20 text-primary">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Advanced SEO Analysis</h3>
            <p className="text-sm text-muted-foreground">Meta tags, headings, schema, links & keyword analysis</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-6 border-t border-border/50 pt-6">
          {/* Meta Tags */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" /> Meta Tags
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Title Tag</span>
                  <MetaStatus status={seo.metaTitle.status} />
                </div>
                <p className="text-sm text-muted-foreground truncate">{seo.metaTitle.value || 'Not found'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', seo.metaTitle.status === 'good' ? 'bg-success' : 'bg-warning')}
                      style={{ width: `${Math.min((seo.metaTitle.length / 60) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{seo.metaTitle.length}/60</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Meta Description</span>
                  <MetaStatus status={seo.metaDescription.status} />
                </div>
                <p className="text-sm text-muted-foreground truncate">{seo.metaDescription.value || 'Not found'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', seo.metaDescription.status === 'good' ? 'bg-success' : 'bg-warning')}
                      style={{ width: `${Math.min((seo.metaDescription.length / 160) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{seo.metaDescription.length}/160</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical SEO Checks */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Code className="w-4 h-4" /> Technical SEO
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Canonical Tag', ok: seo.hasCanonical },
                { label: 'Robots.txt', ok: seo.hasRobotsTxt },
                { label: 'Sitemap', ok: seo.hasSitemap },
                { label: 'Structured Data', ok: seo.hasStructuredData },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <StatusIcon ok={item.ok} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            {seo.structuredDataTypes.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className="text-xs text-muted-foreground">Schema types:</span>
                {seo.structuredDataTypes.map(t => (
                  <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Images & Links */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Image className="w-4 h-4" /> Images
              </h4>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Total Images</span>
                  <span className="text-sm font-bold">{seo.totalImages}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Missing Alt Text</span>
                  <span className={cn('text-sm font-bold', seo.imagesWithoutAlt > 0 ? 'text-destructive' : 'text-success')}>
                    {seo.imagesWithoutAlt}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Link2 className="w-4 h-4" /> Links
              </h4>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Internal Links</span>
                  <span className="text-sm font-bold">{seo.internalLinks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">External Links</span>
                  <span className="text-sm font-bold">{seo.externalLinks}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Heading Structure */}
          {seo.headingStructure.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Heading Structure ({seo.headingStructure.length} headings)
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-1 p-3 rounded-lg bg-muted/30 border border-border/50">
                {seo.headingStructure.map((h, i) => (
                  <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${(parseInt(h.tag[1]) - 1) * 16}px` }}>
                    <span className={cn(
                      'px-1.5 py-0.5 text-xs font-mono rounded',
                      h.tag === 'H1' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      {h.tag}
                    </span>
                    <span className="text-sm text-foreground truncate">{h.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keyword Cloud */}
          {seo.keywordCloud.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Top Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {seo.keywordCloud.map((kw, i) => {
                  const maxCount = seo.keywordCloud[0].count;
                  const ratio = kw.count / maxCount;
                  const size = ratio > 0.7 ? 'text-lg' : ratio > 0.4 ? 'text-base' : 'text-sm';
                  const opacity = ratio > 0.7 ? 'opacity-100' : ratio > 0.4 ? 'opacity-80' : 'opacity-60';
                  return (
                    <span
                      key={i}
                      className={cn('px-3 py-1 rounded-full bg-primary/10 text-primary font-medium', size, opacity)}
                    >
                      {kw.word} <span className="text-xs opacity-70">({kw.count})</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
