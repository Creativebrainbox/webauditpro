import { Search, Zap, Shield, Eye, Smartphone, TrendingUp, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const iconMap: Record<string, LucideIcon> = { Search, Zap, Shield, Eye, Smartphone, TrendingUp };

const tooltips: Record<string, string> = {
  SEO: 'Search engine optimization quality including meta tags, headings, and content structure.',
  Performance: 'Page load speed, resource optimization, and rendering efficiency.',
  Security: 'HTTPS status, mixed content, and other security indicators.',
  Accessibility: 'WCAG compliance including alt text, ARIA attributes, and contrast.',
  Mobile: 'Mobile responsiveness, viewport configuration, and touch targets.',
  Conversion: 'CTA effectiveness, user experience, and conversion optimization.',
};

interface ScoreCardProps {
  label: string;
  score: number;
  icon: string;
}

export const ScoreCard = ({ label, score, icon }: ScoreCardProps) => {
  const Icon = iconMap[icon] || Zap;
  const color = score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-destructive';
  const bg = score >= 80 ? 'bg-success/10 border-success/20' : score >= 60 ? 'bg-warning/10 border-warning/20' : 'bg-destructive/10 border-destructive/20';
  const progressColor = score >= 80 ? 'bg-success' : score >= 60 ? 'bg-warning' : 'bg-destructive';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('glass-card rounded-xl p-4 border opacity-0 animate-fade-up cursor-default', bg)}>
          <div className="flex items-center gap-2 mb-3">
            <Icon className={cn('w-4 h-4', color)} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          </div>
          <div className={cn('text-3xl font-bold mb-2', color)}>{score}</div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-1000 ease-out', progressColor)} style={{ width: `${score}%` }} />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">{tooltips[label] || `${label} score out of 100.`}</p>
      </TooltipContent>
    </Tooltip>
  );
};
