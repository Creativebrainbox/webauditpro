import { MessageCircle, Send, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuditResult } from '@/types/audit';

const WHATSAPP_NUMBER = '447451250738';
const TELEGRAM_HANDLE = 'webauditpro';
const SUPPORT_EMAIL = 'webauditproteam@gmail.com';

interface SupportContactProps {
  result: AuditResult;
}

export const SupportContact = ({ result }: SupportContactProps) => {
  const message = `Hi there! 👋\n\nI just reviewed my AI Visibility Report for *${result.domain}* and I'm genuinely surprised by how many visibility leaks were flagged.\n\nScore: ${result.overallScore}/100 — clearly there's work to do, and I'd rather fix it before my competitors pull further ahead.\n\nI'm interested in starting Phase 1 (AI Agent Optimization). Can you walk me through what the first 30 days look like, turnaround time, and pricing?\n\nAlso — do you offer any guarantees or performance benchmarks once the fixes are live?\n\nLooking forward to hearing from you.`;
  const encoded = encodeURIComponent(message);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  const telegramUrl = `https://t.me/${TELEGRAM_HANDLE}`;
  const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`AI Visibility Report — ${result.domain}`)}&body=${encoded}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-success/30 bg-gradient-to-br from-success/10 via-background to-primary/10 p-8 animate-fade-up">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-success/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative max-w-2xl mx-auto text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/15 border border-success/30 text-success text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Ready to Activate Your AI Storefront?
        </div>

        <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
          “I just saw my AI Visibility Report. Let's start Phase 1 and unlock
          the free AI traffic your competitors are already getting.”
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1ebe57] text-white shadow-glow">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" className="bg-[#229ED9] hover:bg-[#1b87bb] text-white shadow-glow">
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
              <Send className="w-5 h-5" />
              Telegram
            </a>
          </Button>
          <Button asChild size="lg" variant="gradient">
            <a href={emailUrl}>
              <Mail className="w-5 h-5" />
              Email
            </a>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-1">
          💬 Free consultation • No commitment • Reply within 24h
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground/80 font-mono">
          <span>+{WHATSAPP_NUMBER.replace(/(\d{2})(\d{4})(\d{6})/, '$1 $2 $3')}</span>
          <span>t.me/{TELEGRAM_HANDLE}</span>
          <span>{SUPPORT_EMAIL}</span>
        </div>
      </div>
    </div>
  );
};
