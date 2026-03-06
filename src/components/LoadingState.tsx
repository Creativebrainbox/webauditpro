import { useEffect, useState } from 'react';
import { 
  Search, Zap, Shield, Smartphone, Eye, TrendingUp, Check, Globe, Code, BarChart3, Image, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { icon: Globe, label: 'Connecting to website...', duration: 600 },
  { icon: Search, label: 'Crawling pages & extracting content...', duration: 800 },
  { icon: Code, label: 'Detecting platform & technologies...', duration: 500 },
  { icon: BarChart3, label: 'Analyzing SEO & meta tags...', duration: 700 },
  { icon: Zap, label: 'Testing performance metrics...', duration: 600 },
  { icon: Image, label: 'Scanning images & media...', duration: 400 },
  { icon: Lock, label: 'Checking security & HTTPS...', duration: 500 },
  { icon: Smartphone, label: 'Testing mobile responsiveness...', duration: 400 },
  { icon: Eye, label: 'Evaluating accessibility...', duration: 400 },
  { icon: TrendingUp, label: 'Calculating revenue impact...', duration: 500 },
  { icon: Shield, label: 'Generating report...', duration: 600 },
];

interface LoadingStateProps {
  url: string;
}

export const LoadingState = ({ url }: LoadingStateProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const advanceStep = (step: number) => {
      if (step < steps.length) {
        setCompletedSteps(prev => [...prev, step]);
        setCurrentStep(step + 1);
        
        if (step + 1 < steps.length) {
          timeout = setTimeout(() => advanceStep(step + 1), steps[step + 1].duration);
        }
      }
    };

    timeout = setTimeout(() => advanceStep(0), steps[0].duration);
    return () => clearTimeout(timeout);
  }, []);

  const progress = Math.round((completedSteps.length / steps.length) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Zap className="w-4 h-4" />
          AI-Powered Analysis
        </div>
        <h2 className="text-3xl font-bold mb-2">Analyzing Your Website</h2>
        <p className="text-muted-foreground text-lg">{url}</p>
      </div>
      
      {/* Progress bar */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Progress</span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-info rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="w-full max-w-lg space-y-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index && !isCompleted;
          
          return (
            <div
              key={index}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                isCompleted && 'bg-success/10 border border-success/20',
                isCurrent && 'bg-primary/10 border border-primary/30 animate-pulse',
                !isCompleted && !isCurrent && 'bg-muted/20 border border-transparent opacity-40'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-lg transition-colors',
                isCompleted && 'bg-success/20 text-success',
                isCurrent && 'bg-primary/20 text-primary',
                !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
              )}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className={cn('w-4 h-4', isCurrent && 'animate-pulse')} />
                )}
              </div>
              <span className={cn(
                'text-sm font-medium transition-colors',
                isCompleted && 'text-success',
                isCurrent && 'text-primary',
                !isCompleted && !isCurrent && 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
