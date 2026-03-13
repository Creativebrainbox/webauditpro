import { useState } from 'react';
import { AuditResult } from '@/types/audit';
import { OverallScore } from './OverallScore';
import { CategoryCard } from './CategoryCard';
import { IssueCard } from './IssueCard';
import { ProposalDownload } from './ProposalDownload';
import { ScoreCard } from './ScoreCard';
import { PlatformBadge } from './PlatformBadge';
import { TechStack } from './TechStack';
import { AdvancedSeoSection } from './AdvancedSeoSection';
import { ExtendedAuditSection } from './ExtendedAuditSection';
import { ReportNavigation } from './ReportNavigation';
import { ShareReport } from './ShareReport';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditResultsProps {
  result: AuditResult;
  onReset: () => void;
}

export const AuditResults = ({ result, onReset }: AuditResultsProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [severityTab, setSeverityTab] = useState<'all' | 'critical' | 'warning' | 'passed'>('all');
  const [activeSection, setActiveSection] = useState('summary');

  const filteredIssues = result.issues.filter(issue => {
    if (selectedCategory && issue.category !== selectedCategory) return false;
    if (priorityFilter && issue.priority !== priorityFilter) return false;
    if (severityTab === 'critical' && !['critical', 'error'].includes(issue.severity)) return false;
    if (severityTab === 'warning' && issue.severity !== 'warning') return false;
    if (severityTab === 'passed' && issue.severity !== 'info') return false;
    return true;
  });

  const severityOrder = ['critical', 'error', 'warning', 'info'];
  const sortedIssues = [...filteredIssues].sort((a, b) => 
    severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  const criticalCount = result.issues.filter(i => ['critical', 'error'].includes(i.severity)).length;
  const warningCount = result.issues.filter(i => i.severity === 'warning').length;
  const passedCount = result.issues.filter(i => i.severity === 'info').length;

  // Check if active section is an extended audit section
  const extendedSections = ['headers', 'dns', 'email', 'ssl', 'safebrowsing', 'favicon', 'legal', 'opengraph', 'brokenlinks', 'tracking', 'contentquality', 'robotstxt', 'sitemap'];
  const isExtendedSection = extendedSections.includes(activeSection);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onReset} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            New Audit
          </Button>
          <div className="flex items-center gap-3">
            {result.reportId && <ShareReport reportId={result.reportId} />}
          </div>
        </div>

        {/* Platform & Domain Info */}
        <div className="flex flex-wrap items-center gap-3">
          {result.detectedPlatform && <PlatformBadge platform={result.detectedPlatform} />}
          {result.technologies && result.technologies.length > 0 && <TechStack technologies={result.technologies} />}
        </div>

        {/* Overall Score */}
        <OverallScore result={result} />

        {/* Report Navigation */}
        <ReportNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          extendedAudit={result.extendedAudit}
        />

        {/* Summary Section */}
        {activeSection === 'summary' && (
          <>
            {/* Score Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <ScoreCard label="SEO" score={result.seoScore} icon="Search" />
              <ScoreCard label="Performance" score={result.pageSpeed} icon="Zap" />
              <ScoreCard label="Security" score={result.securityScore} icon="Shield" />
              <ScoreCard label="Accessibility" score={result.accessibilityScore} icon="Eye" />
              <ScoreCard label="Mobile" score={result.mobileScore} icon="Smartphone" />
              <ScoreCard label="Conversion" score={result.conversionScore} icon="TrendingUp" />
            </div>
            
            {/* Download Proposal */}
            <ProposalDownload result={result} />

            {/* Category Cards */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Audit Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.categories.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === category.name ? null : category.name);
                      setActiveSection('issues');
                    }}
                    isSelected={selectedCategory === category.name}
                    index={index}
                  />
                ))}
              </div>
            </div>

            {/* Summary text */}
            {result.summary && (
              <div className="glass-card rounded-xl border border-border/50 p-6">
                <h3 className="font-semibold text-lg mb-3">Executive Summary</h3>
                <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
              </div>
            )}
          </>
        )}

        {/* SEO Section */}
        {activeSection === 'seo' && result.advancedSeo && (
          <AdvancedSeoSection seo={result.advancedSeo} />
        )}

        {/* Performance Section - show performance-related issues */}
        {activeSection === 'performance' && (
          <div className="space-y-4">
            <div className="glass-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold text-lg mb-4">Performance Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <ScoreCard label="Page Speed" score={result.pageSpeed} icon="Zap" />
              </div>
            </div>
            {result.issues.filter(i => i.category === 'Performance').map((issue, index) => (
              <IssueCard key={issue.id} issue={issue} index={index} />
            ))}
            {result.issues.filter(i => i.category === 'Performance').length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No performance issues detected.</div>
            )}
          </div>
        )}

        {/* Mobile Section */}
        {activeSection === 'mobile' && (
          <div className="space-y-4">
            <div className="glass-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold text-lg mb-4">Mobile Responsiveness</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <ScoreCard label="Mobile Score" score={result.mobileScore} icon="Smartphone" />
              </div>
            </div>
            {result.issues.filter(i => i.category === 'Mobile').map((issue, index) => (
              <IssueCard key={issue.id} issue={issue} index={index} />
            ))}
            {result.issues.filter(i => i.category === 'Mobile').length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No mobile issues detected.</div>
            )}
          </div>
        )}

        {/* Accessibility Section */}
        {activeSection === 'accessibility' && (
          <div className="space-y-4">
            <div className="glass-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold text-lg mb-4">Accessibility</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <ScoreCard label="Accessibility" score={result.accessibilityScore} icon="Eye" />
              </div>
            </div>
            {result.issues.filter(i => i.category === 'Accessibility').map((issue, index) => (
              <IssueCard key={issue.id} issue={issue} index={index} />
            ))}
            {result.issues.filter(i => i.category === 'Accessibility').length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No accessibility issues detected.</div>
            )}
          </div>
        )}

        {/* Extended Audit Sections */}
        {isExtendedSection && result.extendedAudit && (
          <ExtendedAuditSection data={result.extendedAudit} activeSection={activeSection} />
        )}

        {/* All Issues Section */}
        {activeSection === 'issues' && (
          <div>
            {/* Severity Tabs */}
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSeverityTab('all')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
                    severityTab === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  All Issues ({result.issues.length})
                </button>
                <button
                  onClick={() => setSeverityTab('critical')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
                    severityTab === 'critical' ? 'bg-destructive text-destructive-foreground' : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  )}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Critical ({criticalCount})
                </button>
                <button
                  onClick={() => setSeverityTab('warning')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
                    severityTab === 'warning' ? 'bg-warning text-warning-foreground' : 'bg-warning/10 text-warning hover:bg-warning/20'
                  )}
                >
                  <AlertCircle className="w-4 h-4" />
                  Warnings ({warningCount})
                </button>
                <button
                  onClick={() => setSeverityTab('passed')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
                    severityTab === 'passed' ? 'bg-success text-success-foreground' : 'bg-success/10 text-success hover:bg-success/20'
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Passed ({passedCount})
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">
                  {selectedCategory ? `${selectedCategory} Issues` : 'All Issues'} 
                  <span className="text-muted-foreground font-normal ml-2">({sortedIssues.length})</span>
                </h2>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <div className="flex gap-2">
                    {['high', 'medium', 'low'].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setPriorityFilter(priorityFilter === priority ? null : priority)}
                        className={cn(
                          'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                          priorityFilter === priority
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        )}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </button>
                    ))}
                    {(selectedCategory || priorityFilter) && (
                      <button
                        onClick={() => { setSelectedCategory(null); setPriorityFilter(null); }}
                        className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {sortedIssues.map((issue, index) => (
                <IssueCard key={issue.id} issue={issue} index={index} />
              ))}
            </div>
            
            {sortedIssues.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No issues found matching the current filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
