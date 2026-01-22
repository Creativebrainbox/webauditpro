import { useState } from 'react';
import { 
  AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp,
  DollarSign, TrendingUp, CheckCircle2
} from 'lucide-react';
import { AuditIssue } from '@/types/audit';
import { cn } from '@/lib/utils';

interface IssueCardProps {
  issue: AuditIssue;
  index: number;
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive',
    badge: 'bg-destructive/20 text-destructive',
    label: 'Critical',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    text: 'text-warning',
    badge: 'bg-warning/20 text-warning',
    label: 'Error',
  },
  warning: {
    icon: Info,
    bg: 'bg-info/10',
    border: 'border-info/30',
    text: 'text-info',
    badge: 'bg-info/20 text-info',
    label: 'Warning',
  },
  info: {
    icon: Info,
    bg: 'bg-muted',
    border: 'border-border',
    text: 'text-muted-foreground',
    badge: 'bg-muted text-muted-foreground',
    label: 'Info',
  },
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const IssueCard = ({ issue, index }: IssueCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-300 opacity-0 animate-fade-up overflow-hidden',
        config.bg,
        config.border,
        `stagger-${Math.min(index + 1, 6)}`
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={cn('p-2 rounded-lg', config.badge)}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', config.badge)}>
                  {config.label}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                  {issue.category}
                </span>
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  issue.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                  issue.priority === 'medium' ? 'bg-warning/20 text-warning' :
                  'bg-muted text-muted-foreground'
                )}>
                  {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)} Priority
                </span>
              </div>
              <h4 className="font-semibold text-lg mb-2">{issue.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Revenue Impact Summary */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Monthly Loss</p>
                <p className="font-semibold text-destructive">{formatCurrency(issue.revenueLoss)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Potential Gain</p>
                <p className="font-semibold text-success">{formatCurrency(issue.revenueGain)}</p>
              </div>
            </div>
            
            <div className={cn(
              'p-2 rounded-lg transition-colors',
              isExpanded ? 'bg-primary/20' : 'bg-secondary'
            )}>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-0 border-t border-border/50 mt-2">
          <div className="grid md:grid-cols-2 gap-6 pt-5">
            {/* Impact & Recommendation */}
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Business Impact
                </h5>
                <p className="text-sm">{issue.impact}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Recommendation
                </h5>
                <p className="text-sm">{issue.recommendation}</p>
              </div>
            </div>
            
            {/* Revenue Analysis */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Revenue Analysis
              </h5>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-destructive" />
                    <span className="text-xs font-medium text-destructive">Monthly Loss</span>
                  </div>
                  <p className="text-2xl font-bold text-destructive">
                    {formatCurrency(issue.revenueLoss)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estimated revenue lost monthly
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-xs font-medium text-success">If Implemented</span>
                  </div>
                  <p className="text-2xl font-bold text-success">
                    +{formatCurrency(issue.revenueGain)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Projected monthly increase
                  </p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Annual Impact:</strong> Fixing this issue could recover up to{' '}
                  <span className="text-success font-semibold">
                    {formatCurrency((issue.revenueGain + issue.revenueLoss) * 12)}
                  </span>{' '}
                  annually.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
