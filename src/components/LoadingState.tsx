import { useEffect, useState } from 'react';
import { 
  Search, Zap, Shield, Smartphone, Eye, TrendingUp, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { icon: Search, label: 'Crawling website...', duration: 800 },
  { icon: Zap, label: 'Analyzing performance...', duration: 600 },
  { icon: Shield, label: 'Checking security...', duration: 500 },
  { icon: Smartphone, label: 'Testing mobile responsiveness...', duration: 500 },
  { icon: Eye, label: 'Evaluating accessibility...', duration: 400 },
  { icon: TrendingUp, label: 'Calculating revenue impact...', duration: 600 },
];

interface LoadingStateProps {
  url: string;
}

export const LoadingState = ({ url }: LoadingStateProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const advanceStep = () => {
      if (currentStep < steps.length) {
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
        
        if (currentStep + 1 < steps.length) {
          timeout = setTimeout(advanceStep, steps[currentStep + 1].duration);
        }
      }
    };

    timeout = setTimeout(advanceStep, steps[0].duration);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-2">Analyzing Your Website</h2>
        <p className="text-muted-foreground">{url}</p>
      </div>
      
      <div className="w-full max-w-md space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index && !isCompleted;
          
          return (
            <div
              key={index}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl transition-all duration-300',
                isCompleted && 'bg-success/10 border border-success/20',
                isCurrent && 'bg-primary/10 border border-primary/30 animate-pulse',
                !isCompleted && !isCurrent && 'bg-muted/30 border border-transparent opacity-50'
              )}
            >
              <div className={cn(
                'p-2 rounded-lg transition-colors',
                isCompleted && 'bg-success/20 text-success',
                isCurrent && 'bg-primary/20 text-primary',
                !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
              )}>
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className={cn('w-5 h-5', isCurrent && 'animate-pulse')} />
                )}
              </div>
              <span className={cn(
                'font-medium transition-colors',
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
      
      {/* Progress bar */}
      <div className="w-full max-w-md mt-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-info transition-all duration-500 ease-out"
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {Math.round((completedSteps.length / steps.length) * 100)}% complete
        </p>
      </div>
    </div>
  );
};
