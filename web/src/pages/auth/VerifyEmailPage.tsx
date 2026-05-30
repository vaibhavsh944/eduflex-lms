import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [email, setEmail] = useState(emailFromUrl);

  const handleResend = async () => {
    if (!email) { toast.error('Email address is required. Please sign up again.'); return; }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      setResent(true);
      toast.success('Verification email resent!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="flex justify-center mb-2">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          We've sent a verification link to your email address. Please click the link to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder or click below to resend.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={resending || resent}
        >
          {resending ? 'Sending...' : resent ? 'Email sent!' : 'Resend verification email'}
        </Button>
        <div className="pt-2">
          <Link
            to={ROUTES.LOGIN}
            className="text-sm text-primary hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
