import { AuditInput } from './AuditInput';
import { BarChart3, Shield, Zap, DollarSign } from 'lucide-react';

interface HeroProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const features = [
  {
    icon: BarChart3,
    title: 'Comprehensive Analysis',
    description: 'Deep scan of SEO, performance, security & more',
  },
  {
    icon: DollarSign,
    title: 'Revenue Impact',
    description: 'Estimated loss and potential gains per issue',
  },
  {
    icon: Shield,
    title: 'Security Audit',
    description: 'Vulnerability detection and risk assessment',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Get actionable insights in seconds',
  },
];

export const Hero = ({ onSubmit, isLoading }: HeroProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-[0.03]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-info/20 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="w-full py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">WebAudit Pro</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Website Analysis
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Uncover Hidden
            <br />
            <span className="gradient-text">Revenue Opportunities</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Get a comprehensive audit of your website with detailed revenue impact analysis. 
            Discover exactly how much money you're leaving on the table and how to fix it.
          </p>
          
          {/* Audit Input */}
          <AuditInput onSubmit={onSubmit} isLoading={isLoading} />
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="text-center opacity-0 animate-fade-up"
                style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="inline-flex p-3 rounded-xl bg-secondary mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>Analyze any website • Detailed revenue projections • Export professional proposals</p>
        </div>
      </footer>
    </div>
  );
};
