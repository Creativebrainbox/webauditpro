import { Helmet } from 'react-helmet-async';
import { BarChart3, FileText, Shield, Zap, CheckCircle2, ArrowRight, Users, Building2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: FileText,
    title: 'Branded PDF Reports',
    description: 'Every audit report ships with your agency logo, brand colors, and custom cover page — your clients never see WebAudit Pro.',
  },
  {
    icon: Users,
    title: 'Multi-Client Dashboard',
    description: 'Manage unlimited client websites from one dashboard. Organize audits by client and export batch reports in seconds.',
  },
  {
    icon: Shield,
    title: 'Revenue-Focused Insights',
    description: 'Every issue includes estimated revenue impact. Show clients exactly how much money they are leaving on the table.',
  },
  {
    icon: Zap,
    title: 'Instant Turnaround',
    description: 'Run comprehensive audits in under 60 seconds. No manual work, no waiting days for a human analyst.',
  },
];

const checklist = [
  'White-labeled PDF proposals',
  'Custom domain shareable links',
  'Revenue impact calculator per issue',
  'SEO, performance & security audit',
  'Competitor benchmarking included',
  'AI-generated fix recommendations',
];

export const WhiteLabel = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>White Label SEO Reports — Branded Audits for Agencies | WebAudit Pro</title>
        <meta name="description" content="Generate white label SEO reports and website audits under your own brand. PDF exports, revenue analysis, and multi-client dashboard for agencies and freelancers." />
        <link rel="canonical" href="https://webauditpro.lovable.app/white-label" />
        <meta property="og:title" content="White Label SEO Reports — Branded Audits for Agencies" />
        <meta property="og:description" content="Generate white label SEO reports and website audits under your own brand." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://webauditpro.lovable.app/white-label" />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-info/20 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Building2 className="w-4 h-4" />
            For Agencies & Freelancers
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            White Label SEO Reports
            <br />
            <span className="gradient-text">Under Your Brand</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Run professional website audits and deliver branded PDF reports to your clients.
            Revenue impact analysis, competitor benchmarking, and actionable fixes — all white-labeled.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2" onClick={() => window.location.href = '/'}>
              Start a Free Audit
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => window.location.href = '/'}>
              <Globe className="w-5 h-5" />
              Try the Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Built for Agencies That Sell Results</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Replace hours of manual audit work with instant, revenue-focused reports your clients actually understand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="glass-card rounded-xl border border-border/50 p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="inline-flex p-3 rounded-xl bg-secondary mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground">From scan to client-ready report in three steps.</p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Enter Your Client\'s URL',
                desc: 'Paste any public website URL. Our AI scans SEO, performance, security, and revenue-impact issues in under 60 seconds.',
              },
              {
                step: '02',
                title: 'Review the Audit Dashboard',
                desc: 'See a full breakdown: overall health score, revenue forecast, AI crawler access, brand reputation, and prioritized fix list.',
              },
              {
                step: '03',
                title: 'Export a Branded PDF Proposal',
                desc: 'Download a professional proposal with your logo, revenue projections, and a clear roadmap. Send it straight to your client.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="py-16 px-6 border-y border-border/50 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Everything Agencies Need
                <br />
                <span className="gradient-text">In One Report</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Stop stitching together spreadsheets and screenshots. WebAudit Pro gives you a single, client-ready document that sells the value of your services before you even pitch.
              </p>
              <Button size="lg" className="gap-2" onClick={() => window.location.href = '/'}>
                <BarChart3 className="w-5 h-5" />
                Run Your First Audit
              </Button>
            </div>

            <div className="glass-card rounded-xl border border-border/50 p-6">
              <ul className="space-y-3">
                {checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Impress Your Clients?</h2>
          <p className="text-muted-foreground mb-8">
            Run a free audit on any website and see what a white-labeled report looks like — no signup required.
          </p>
          <Button size="lg" className="gap-2" onClick={() => window.location.href = '/'}>
            Start a Free Audit
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>WebAudit Pro — AI-powered website auditing for agencies and freelancers</p>
        </div>
      </footer>
    </div>
  );
};

export default WhiteLabel;
