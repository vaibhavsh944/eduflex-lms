import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CourseWizardProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  canNext: boolean;
  isSubmitting?: boolean;
  children: ReactNode;
}

export function CourseWizard({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canNext,
  isSubmitting,
  children,
}: CourseWizardProps) {
  const isFirst = currentStep === 1;
  const isLast = currentStep === totalSteps;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cn(
                'h-3 w-3 rounded-full transition-colors',
                step === currentStep
                  ? 'bg-primary'
                  : step < currentStep
                    ? 'bg-primary/40'
                    : 'bg-muted-foreground/20',
              )}
            />
            {step < totalSteps && (
              <div
                className={cn(
                  'h-0.5 w-12 transition-colors',
                  step < currentStep ? 'bg-primary/40' : 'bg-muted-foreground/20',
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="min-h-[300px]">{children}</div>

      <div className="flex items-center justify-between border-t pt-6">
        <Button variant="outline" onClick={onBack} disabled={isFirst}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canNext || isSubmitting}>
          {isSubmitting
            ? 'Creating...'
            : isLast
              ? 'Create Course (Draft)'
              : 'Next'}
        </Button>
      </div>
    </div>
  );
}

interface WizardStepProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function WizardStep({ title, description, children }: WizardStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
