import { PageHeader } from '@/components/common/PageHeader';
import { useCertificates } from '@/hooks/queries/useCertificates';
import { CertificateCard } from '@/components/gamification/CertificateCard';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/shared/SEO';
import { GraduationCap } from 'lucide-react';

export function StudentCertificates() {
  const { data: certificates, isLoading } = useCertificates();

  return (
    <>
      <SEO title="Certificates | EduFlow" />
      <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <PageHeader
            title="My Certificates"
            description="Official records of your completed courses."
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="aspect-[1.414/1] rounded-xl" />
          ))}
        </div>
      ) : certificates?.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-card">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No Certificates Yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            Complete a course to 100% to earn your first certificate of completion!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates?.map(cert => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
    </>
  );
}
