export type OpportunityLevel = 'healthy' | 'moderate' | 'high' | 'critical';

export function getOpportunityLevel(score: number): OpportunityLevel {
  if (score >= 90) return 'healthy';
  if (score >= 70) return 'moderate';
  if (score >= 50) return 'high';
  return 'critical';
}

export function getOpportunityLabel(level: OpportunityLevel): string {
  return {
    healthy: 'Healthy Store',
    moderate: 'Moderate Opportunity',
    high: 'High Opportunity',
    critical: 'Critical Opportunity',
  }[level];
}

export function getOpportunityColor(level: OpportunityLevel): string {
  return {
    healthy: 'text-success border-success/40 bg-success/10',
    moderate: 'text-info border-info/40 bg-info/10',
    high: 'text-warning border-warning/40 bg-warning/10',
    critical: 'text-destructive border-destructive/40 bg-destructive/10',
  }[level];
}
