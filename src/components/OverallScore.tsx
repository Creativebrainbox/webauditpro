import { ScoreRing } from './ScoreRing';
import { AuditResult } from '@/types/audit';
import { DollarSign, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverallScoreProps {
  result: AuditResult;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Critical';
};

const getScoreDescription = (score: number): string => {
  if (score >= 90) return 'Your website is performing exceptionally well.';
  if (score >= 70) return 'Good foundation with room for optimization.';
  if (score >= 50) return 'Significant improvements needed for better results.';
  return 'Critical issues detected that require immediate attention.';
};

export const OverallScore = ({ result }: OverallScoreProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const criticalIssues = result.issues.filter(i => i.severity === 'critical').length;

  return (
    <div className="glass-card rounded-2xl p-8 opacity-0 animate-fade-up">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Score Ring */}
        <div className="flex flex-col items-center">
          <ScoreRing score={result.overallScore} size="xl" label="Overall" />
          <div className="mt-4 text-center">
            <p className={cn(
              'text-lg font-semibold',
              result.overallScore >= 70 ? 'text-primary' : 
              result.overallScore >= 50 ? 'text-warning' : 'text-destructive'
            )}>
              {getScoreLabel(result.overallScore)}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {getScoreDescription(result.overallScore)}
            </p>
          </div>
        </div>
        
        {/* Divider */}
        <div className="hidden lg:block w-px h-48 bg-border" />
        
        {/* Details */}
        <div className="flex-1 w-full">
          {/* Domain Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">{result.domain}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Audited on {formatDate(result.auditDate)}</span>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Revenue Loss */}
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-destructive" />
                <span className="text-sm font-medium text-destructive">Monthly Revenue Loss</span>
              </div>
              <p className="text-3xl font-bold text-destructive">
                {formatCurrency(result.totalRevenueLoss)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Estimated loss from detected issues
              </p>
            </div>
            
            {/* Potential Gain */}
            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-success">Potential Monthly Gain</span>
              </div>
              <p className="text-3xl font-bold text-success">
                +{formatCurrency(result.potentialRevenueGain)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                If all recommendations implemented
              </p>
            </div>
            
            {/* Issues Found */}
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span className="text-sm font-medium text-warning">Issues Found</span>
              </div>
              <p className="text-3xl font-bold text-warning">
                {result.issues.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Including {criticalIssues} critical issue{criticalIssues !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
