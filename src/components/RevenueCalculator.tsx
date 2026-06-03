import { useMemo, useState } from 'react';
import { AuditResult } from '@/types/audit';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, TrendingDown, Activity, Info } from 'lucide-react';

interface RevenueCalculatorProps {
  result: AuditResult;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

export const RevenueCalculator = ({ result }: RevenueCalculatorProps) => {
  // Realistic defaults — small business baseline
  const [visitors, setVisitors] = useState<number>(10000);
  const [aov, setAov] = useState<number>(75);
  const [convRate, setConvRate] = useState<number>(2.0); // %

  const { currentRevenue, monthlyLoss, potentialGain, recoverPct, multiplier } = useMemo(() => {
    // Score gap drives lost potential. Lower score → bigger leak.
    const scoreGap = Math.max(0, 100 - result.overallScore) / 100; // 0..1
    const criticalCount = result.issues.filter(i => ['critical', 'error'].includes(i.severity)).length;
    const warningCount = result.issues.filter(i => i.severity === 'warning').length;

    // Issue weight — caps the leak so it stays realistic
    const issueWeight = Math.min(0.5, criticalCount * 0.04 + warningCount * 0.015 + scoreGap * 0.25);

    const baseRevenue = visitors * (convRate / 100) * aov;
    // Current observed revenue (after leaks)
    const currentRevenue = baseRevenue;
    // The leak: revenue you're missing right now due to issues
    const monthlyLoss = baseRevenue * issueWeight;
    // Gain if fixed (AI traffic + conversion lift)
    const aiTrafficLift = 0.15 + scoreGap * 0.4; // 15%-55%
    const conversionLift = 0.1 + scoreGap * 0.2; // 10%-30%
    const potentialGain = baseRevenue * (aiTrafficLift + conversionLift);

    const recoverPct = Math.round((aiTrafficLift + conversionLift) * 100);
    const multiplier = +(1 + aiTrafficLift + conversionLift).toFixed(1);

    return { currentRevenue, monthlyLoss, potentialGain, recoverPct, multiplier };
  }, [visitors, aov, convRate, result.overallScore, result.issues]);

  return (
    <div className="glass-card rounded-2xl border border-border/50 p-6 md:p-8 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/15">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">AI Agentic Revenue Forecast</h3>
          <p className="text-xs text-muted-foreground">
            Adjust your traffic and economics — the leak and upside recalculate in real time.
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm">Monthly Visitors</Label>
            <span className="text-sm font-mono font-semibold text-primary">
              {visitors.toLocaleString()}
            </span>
          </div>
          <Slider
            value={[visitors]}
            min={500}
            max={250000}
            step={500}
            onValueChange={([v]) => setVisitors(v)}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>500</span>
            <span>250k</span>
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Avg Order Value ($)</Label>
          <Input
            type="number"
            value={aov}
            min={1}
            onChange={(e) => setAov(Math.max(1, Number(e.target.value) || 0))}
          />
        </div>
        <div>
          <Label className="text-sm mb-2 block">Conversion Rate (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={convRate}
            min={0.1}
            onChange={(e) => setConvRate(Math.max(0.1, Number(e.target.value) || 0))}
          />
        </div>
        <div className="rounded-lg bg-muted/30 border border-border/40 p-3 text-xs text-muted-foreground flex gap-2">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>Defaults reflect a typical SMB. Plug in your own analytics for sharper numbers.</span>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-muted/30 border border-border/40">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Current Monthly Revenue</div>
          <div className="text-2xl font-bold">{fmt(currentRevenue)}</div>
          <div className="text-xs text-muted-foreground mt-1">Baseline at current traffic</div>
        </div>

        <div className="p-5 rounded-xl bg-destructive/10 border border-destructive/30">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-destructive mb-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Estimated Monthly Leak
          </div>
          <div className="text-2xl font-bold text-destructive">{fmt(monthlyLoss)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Revenue lost from the {result.issues.length} detected issues
          </div>
        </div>

        <div className="p-5 rounded-xl bg-success/10 border border-success/30">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-success mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Potential Monthly Gain
          </div>
          <div className="text-2xl font-bold text-success">+{fmt(potentialGain)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            ~{recoverPct}% lift → {multiplier}x revenue after fixes
          </div>
        </div>
      </div>
    </div>
  );
};
