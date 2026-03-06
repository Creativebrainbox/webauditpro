import { Globe, ShoppingBag, Code, Palette, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';

const platformConfig: Record<string, { icon: typeof Globe; color: string }> = {
  'Shopify': { icon: ShoppingBag, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  'WordPress': { icon: Code, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'Wix': { icon: Palette, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  'Webflow': { icon: Layout, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'Squarespace': { icon: Globe, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
};

interface PlatformBadgeProps {
  platform: string;
}

export const PlatformBadge = ({ platform }: PlatformBadgeProps) => {
  const config = platformConfig[platform] || { icon: Globe, color: 'bg-muted text-muted-foreground border-border' };
  const Icon = config.icon;

  return (
    <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium', config.color)}>
      <Icon className="w-4 h-4" />
      <span>Platform: {platform}</span>
    </div>
  );
};
