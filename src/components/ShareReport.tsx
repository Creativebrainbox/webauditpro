import { useState } from 'react';
import { Share2, Check, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareReportProps {
  reportId: string;
}

export const ShareReport = ({ reportId }: ShareReportProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/report/${reportId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
      {copied ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
      {copied ? 'Copied!' : 'Share Report'}
    </Button>
  );
};
