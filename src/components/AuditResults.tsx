import { useState } from 'react';
import { AuditResult } from '@/types/audit';
import { OverallScore } from './OverallScore';
import { CategoryCard } from './CategoryCard';
import { IssueCard } from './IssueCard';
import { ProposalDownload } from './ProposalDownload';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter } from 'lucide-react';

interface AuditResultsProps {
  result: AuditResult;
  onReset: () => void;
}

export const AuditResults = ({ result, onReset }: AuditResultsProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const filteredIssues = result.issues.filter(issue => {
    if (selectedCategory && issue.category !== selectedCategory) return false;
    if (priorityFilter && issue.priority !== priorityFilter) return false;
    return true;
  });

  const severityOrder = ['critical', 'error', 'warning', 'info'];
  const sortedIssues = [...filteredIssues].sort((a, b) => 
    severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onReset}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            New Audit
          </Button>
        </div>

        {/* Overall Score */}
        <OverallScore result={result} />
        
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
                onClick={() => setSelectedCategory(
                  selectedCategory === category.name ? null : category.name
                )}
                isSelected={selectedCategory === category.name}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Issues List */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold">
              {selectedCategory ? `${selectedCategory} Issues` : 'All Issues'} 
              <span className="text-muted-foreground font-normal ml-2">
                ({sortedIssues.length})
              </span>
            </h2>
            
            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-2">
                {['high', 'medium', 'low'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setPriorityFilter(
                      priorityFilter === priority ? null : priority
                    )}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      priorityFilter === priority
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
                {(selectedCategory || priorityFilter) && (
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setPriorityFilter(null);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                  >
                    Clear All
                  </button>
                )}
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
      </div>
    </div>
  );
};
