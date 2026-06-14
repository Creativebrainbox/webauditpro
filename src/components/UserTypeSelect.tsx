import { Store, Briefcase } from 'lucide-react';
import { UserType } from '@/types/lead';
import { cn } from '@/lib/utils';

interface Props {
  value: UserType | null;
  onChange: (v: UserType) => void;
}

export const UserTypeSelect = ({ value, onChange }: Props) => {
  const options: { id: UserType; icon: typeof Store; title: string; desc: string }[] = [
    { id: 'store_owner', icon: Store, title: 'Shopify Store Owner', desc: 'I run my own ecommerce store' },
    { id: 'agency', icon: Briefcase, title: 'Agency / Shopify Expert', desc: 'I audit websites for clients (white-label)' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              'group relative p-6 rounded-2xl border-2 text-left transition-all',
              active
                ? 'border-primary bg-primary/10 shadow-glow'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            <div className={cn(
              'inline-flex p-3 rounded-xl mb-4 transition-colors',
              active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{opt.title}</h3>
            <p className="text-sm text-muted-foreground">{opt.desc}</p>
          </button>
        );
      })}
    </div>
  );
};
