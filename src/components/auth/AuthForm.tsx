import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { PasswordStrength } from './PasswordStrength';
import { supabase } from '@/integrations/supabase/client';
import {
  signupSchema,
  loginSchema,
  SignupFormData,
  LoginFormData,
} from '@/lib/validations';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { signUp, signIn } = useAuth();

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const form = mode === 'signup' ? signupForm : loginForm;
  const watchPassword = mode === 'signup' ? signupForm.watch('password') : '';

  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase.rpc('check_username_exists', {
        check_username: username,
      });

      if (error) throw error;
      setUsernameAvailable(!data);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const onSubmit = async (data: SignupFormData | LoginFormData) => {
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const signupData = data as SignupFormData;
        
        // Final username check
        const { data: exists } = await supabase.rpc('check_username_exists', {
          check_username: signupData.username,
        });

        if (exists) {
          toast({
            variant: 'destructive',
            title: 'Username taken',
            description: 'This username is already in use. Please choose another.',
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(
          signupData.email,
          signupData.password,
          signupData.username
        );

        if (error) throw error;

        toast({
          title: 'Account created!',
          description: 'Welcome aboard. You are now logged in.',
        });
      } else {
        const loginData = data as LoginFormData;
        const { error } = await signIn(loginData.email, loginData.password);

        if (error) throw error;

        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
      }
    } catch (error: any) {
      let message = 'An unexpected error occurred';
      
      if (error.message?.includes('Invalid login credentials')) {
        message = 'Invalid user credentials';
      } else if (error.message?.includes('User already registered')) {
        message = 'This email is already registered. Please log in instead.';
      } else if (error.message) {
        message = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-slide-up">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'signup'
            ? 'Enter your details to get started'
            : 'Enter your credentials to access your account'}
        </p>
      </div>

      {/* Warning for signup */}
      {mode === 'signup' && (
        <div className="mb-6 p-4 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-warning">
            <strong>Important:</strong> Email, Username, and Password cannot be changed once registered.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              {...(mode === 'signup' ? signupForm.register('email') : loginForm.register('email'))}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Username (signup only) */}
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Choose a unique username"
                className={cn(
                  'pl-10 pr-10',
                  usernameAvailable === false && 'border-destructive focus-visible:ring-destructive'
                )}
                {...signupForm.register('username', {
                  onChange: (e) => checkUsername(e.target.value),
                })}
              />
              {checkingUsername && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
              )}
              {!checkingUsername && usernameAvailable === true && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-success flex items-center justify-center">
                  <span className="text-success-foreground text-xs">✓</span>
                </div>
              )}
              {!checkingUsername && usernameAvailable === false && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
                  <span className="text-destructive-foreground text-xs">✗</span>
                </div>
              )}
            </div>
            {signupForm.formState.errors.username && (
              <p className="text-sm text-destructive">
                {signupForm.formState.errors.username.message}
              </p>
            )}
            {usernameAvailable === false && (
              <p className="text-sm text-destructive">
                This username is already taken
              </p>
            )}
          </div>
        )}

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
              className="pl-10 pr-10"
              {...(mode === 'signup' ? signupForm.register('password') : loginForm.register('password'))}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Password strength (signup only) */}
        {mode === 'signup' && watchPassword && (
          <PasswordStrength password={watchPassword} />
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          disabled={isLoading || (mode === 'signup' && usernameAvailable === false)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
            </>
          ) : (
            <>{mode === 'signup' ? 'Create Account' : 'Sign In'}</>
          )}
        </Button>
      </form>

      {/* Toggle mode */}
      <div className="mt-6 text-center">
        <p className="text-muted-foreground">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-primary hover:underline font-medium"
          >
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
