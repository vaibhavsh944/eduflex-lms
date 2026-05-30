import type { Certificate } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Award, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const { user } = useAuthStore();

  const handleViewPdf = () => {
    if (certificate.pdf_url) {
      window.open(certificate.pdf_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = () => {
    if (certificate.pdf_url) {
      const a = document.createElement('a');
      a.href = certificate.pdf_url;
      a.download = `certificate-${certificate.verification_code || certificate.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShareLink = () => {
    const code = certificate.verification_code || certificate.id;
    const url = `${window.location.origin}/verify/${code}`;
    navigator.clipboard.writeText(url);
    toast.success('Verification link copied to clipboard!');
  };

  return (
    <Card className="overflow-hidden card-hover group">
      <div className="relative aspect-[1.414/1] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-b p-6 flex flex-col items-center justify-center text-center">
        <div className="absolute inset-2 border-2 border-primary/20 rounded-sm pointer-events-none" />
        <div className="absolute inset-3 border border-primary/10 rounded-sm pointer-events-none" />

        <Award className="h-12 w-12 text-primary mb-4 opacity-80" />
        <h4 className="text-sm font-serif uppercase tracking-widest text-muted-foreground mb-1">Certificate of Completion</h4>
        <h3 className="text-xl font-bold font-serif mb-4 leading-tight">{certificate.course?.title}</h3>
        <p className="text-sm italic text-muted-foreground">Awarded to</p>
        <p className="text-lg font-semibold">{user?.full_name}</p>

        <div className="absolute bottom-6 left-6 text-left">
          <p className="text-[10px] text-muted-foreground uppercase">Date</p>
          <p className="text-xs font-semibold">{format(new Date(certificate.issued_at), 'MMM d, yyyy')}</p>
        </div>
        <div className="absolute bottom-6 right-6 text-right">
          <p className="text-[10px] text-muted-foreground uppercase">ID</p>
          <p className="text-xs font-mono">{certificate.verification_code?.split('-')[0] || certificate.id.split('-')[0]}</p>
        </div>

        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {certificate.pdf_url && (
            <>
              <Button variant="default" size="sm" onClick={handleViewPdf}>
                <ExternalLink className="mr-1.5 h-4 w-4" />
                View PDF
              </Button>
              <Button variant="default" size="sm" onClick={handleDownload}>
                <Download className="mr-1.5 h-4 w-4" />
                Download
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleShareLink}>
            <Copy className="mr-1.5 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
      <CardContent className="p-4 bg-card">
        <h4 className="font-semibold line-clamp-1">{certificate.course?.title}</h4>
        <p className="text-xs text-muted-foreground mt-1">Issued {format(new Date(certificate.issued_at), 'MMMM d, yyyy')}</p>
      </CardContent>
    </Card>
  );
}
