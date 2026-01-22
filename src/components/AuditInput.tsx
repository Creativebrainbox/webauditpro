import { useState } from 'react';
import { Globe, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuditInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const AuditInput = ({ onSubmit, isLoading }: AuditInputProps) => {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          'relative flex items-center gap-2 p-2 rounded-2xl transition-all duration-300',
          'bg-card border-2',
          isFocused 
            ? 'border-primary shadow-glow' 
            : 'border-border hover:border-primary/50'
        )}
      >
        <div className="flex items-center gap-3 flex-1 pl-4">
          <Globe className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter website URL (e.g., example.com)"
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg"
            disabled={isLoading}
          />
        </div>
        
        <Button 
          type="submit" 
          variant="hero"
          size="lg"
          disabled={!url.trim() || isLoading}
          className="px-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Audit Now
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
      
      <p className="text-center text-sm text-muted-foreground mt-4">
        Free comprehensive analysis • No signup required • Results in seconds
      </p>
    </form>
  );
};
