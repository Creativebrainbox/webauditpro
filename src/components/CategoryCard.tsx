import { 
  Zap, Search, Shield, Smartphone, Eye, TrendingUp, MousePointer, Palette,
  LucideIcon
} from 'lucide-react';
import { ScoreRing } from './ScoreRing';
import { AuditCategory } from '@/types/audit';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  Zap,
  Search,
  Shield,
  Smartphone,
  Eye,
  TrendingUp,
  MousePointer,
  Palette,
};

interface CategoryCardProps {
  category: AuditCategory;
  onClick: () => void;
  isSelected: boolean;
  index: number;
}

export const CategoryCard = ({ category, onClick, isSelected, index }: CategoryCardProps) => {
  const Icon = iconMap[category.icon] || Zap;
  
  const criticalCount = category.issues.filter(i => i.severity === 'critical').length;
  const errorCount = category.issues.filter(i => i.severity === 'error').length;
  const warningCount = category.issues.filter(i => i.severity === 'warning').length;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-6 rounded-xl text-left transition-all duration-300 opacity-0 animate-fade-up',
        'glass-card hover:shadow-elevated',
        isSelected && 'ring-2 ring-primary gradient-border',
        `stagger-${index + 1}`
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2.5 rounded-lg',
            category.score >= 70 ? 'bg-primary/20 text-primary' : 
            category.score >= 50 ? 'bg-warning/20 text-warning' : 
            'bg-destructive/20 text-destructive'
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              {category.issues.length} issue{category.issues.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        <ScoreRing score={category.score} size="sm" showLabel={false} />
      </div>
      
      {/* Issue severity badges */}
      <div className="flex gap-2 flex-wrap">
        {criticalCount > 0 && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-destructive/20 text-destructive">
            {criticalCount} Critical
          </span>
        )}
        {errorCount > 0 && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning/20 text-warning">
            {errorCount} Errors
          </span>
        )}
        {warningCount > 0 && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-info/20 text-info">
            {warningCount} Warnings
          </span>
        )}
      </div>
    </button>
  );
};
