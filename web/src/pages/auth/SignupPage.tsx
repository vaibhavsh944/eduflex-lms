import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';
import { signUpWithEmail } from '@/lib/supabase';
import { SEO } from '@/components/shared/SEO';
import { GraduationCap, School } from 'lucide-react';
import { cn } from '@/lib/utils';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'instructor']),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

export function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor'>('student');
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'student' },
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    setError('');
    try {
      const { error: authError } = await signUpWithEmail(data.email, data.password, {
        full_name: data.fullName,
        role: data.role,
      });
      if (authError) throw authError;
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.VERIFY_EMAIL), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: 'student' | 'instructor') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  if (success) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>We sent a confirmation link to your email. Please verify to complete sign up.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => navigate(ROUTES.LOGIN)}>Go to Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <SEO title="Create Account | EduFlow" />
      <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Enter your details to get started</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-destructive">{error}</div>}

          {/* Role Selector */}
          <div className="space-y-2">
            <Label>I want to join as</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                  selectedRole === 'student'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50',
                )}
              >
                <GraduationCap className={cn('h-8 w-8', selectedRole === 'student' ? 'text-primary' : 'text-muted-foreground')} />
                <span className={cn('text-sm font-medium', selectedRole === 'student' ? 'text-primary' : 'text-foreground')}>I'm a Student</span>
                <span className="text-xs text-muted-foreground">Learn at your own pace</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('instructor')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                  selectedRole === 'instructor'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50',
                )}
              >
                <School className={cn('h-8 w-8', selectedRole === 'instructor' ? 'text-primary' : 'text-muted-foreground')} />
                <span className={cn('text-sm font-medium', selectedRole === 'instructor' ? 'text-primary' : 'text-foreground')}>I'm an Instructor</span>
                <span className="text-xs text-muted-foreground">Create and sell courses</span>
              </button>
            </div>
            <input type="hidden" {...register('role')} />
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...register('fullName')} placeholder="John Doe" />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} placeholder="name@example.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} placeholder="••••••••" />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} placeholder="••••••••" />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
    </>
  );
}
