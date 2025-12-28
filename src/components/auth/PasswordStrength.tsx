import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = useMemo(() => {
    return [
      {
        label: 'At least 8 characters',
        passed: password.length >= 8,
      },
      {
        label: 'Contains special character (@!$%^&*|)',
        passed: /[@!$%^&*|]/.test(password),
      },
    ];
  }, [password]);

  const passedCount = checks.filter((c) => c.passed).length;
  const strengthPercentage = (passedCount / checks.length) * 100;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 rounded-full',
            strengthPercentage === 100 ? 'bg-success' : 
            strengthPercentage >= 50 ? 'bg-warning' : 'bg-destructive'
          )}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>

      {/* Check items */}
      <div className="space-y-1.5">
        {checks.map((check, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-2 text-sm transition-colors duration-300',
              check.passed ? 'text-success' : 'text-muted-foreground'
            )}
          >
            {check.passed ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
