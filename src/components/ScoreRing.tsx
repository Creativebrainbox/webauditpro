import { cn } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizes = {
  sm: { width: 60, stroke: 6, fontSize: 'text-lg' },
  md: { width: 100, stroke: 8, fontSize: 'text-2xl' },
  lg: { width: 160, stroke: 10, fontSize: 'text-4xl' },
  xl: { width: 200, stroke: 12, fontSize: 'text-5xl' },
};

const getScoreColor = (score: number): string => {
  if (score >= 90) return 'stroke-success';
  if (score >= 70) return 'stroke-primary';
  if (score >= 50) return 'stroke-warning';
  return 'stroke-destructive';
};

const getScoreGradient = (score: number): string => {
  if (score >= 90) return 'var(--gradient-score-excellent)';
  if (score >= 70) return 'var(--gradient-score-good)';
  if (score >= 50) return 'var(--gradient-score-average)';
  return 'var(--gradient-score-poor)';
};

export const ScoreRing = ({ 
  score, 
  size = 'md', 
  showLabel = true, 
  label,
  className 
}: ScoreRingProps) => {
  const { width, stroke, fontSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg
        width={width}
        height={width}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        
        {/* Score gradient definition */}
        <defs>
          <linearGradient id={`scoreGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={score >= 90 ? 'hsl(142, 76%, 36%)' : score >= 70 ? 'hsl(173, 80%, 40%)' : score >= 50 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 72%, 51%)'} />
            <stop offset="100%" stopColor={score >= 90 ? 'hsl(158, 64%, 52%)' : score >= 70 ? 'hsl(199, 89%, 48%)' : score >= 50 ? 'hsl(45, 93%, 47%)' : 'hsl(15, 79%, 55%)'} />
          </linearGradient>
        </defs>
        
        {/* Progress ring */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={`url(#scoreGradient-${score})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out animate-score"
          style={{
            '--score-offset': offset,
          } as React.CSSProperties}
        />
      </svg>
      
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', fontSize)}>{score}</span>
        {showLabel && (
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {label || 'Score'}
          </span>
        )}
      </div>
    </div>
  );
};
