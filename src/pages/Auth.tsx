import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { useAuth } from '@/hooks/useAuth';
import { missionMessages } from '@/lib/hero-quotes';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <AuthBackground />
      
      {/* Logo - Avengers Themed */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-14 w-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-repulsor">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <div>
          <span className="text-2xl font-bold gradient-text">{missionMessages.authTitle}</span>
          <p className="text-xs text-muted-foreground">{missionMessages.authSubtitle}</p>
        </div>
      </div>
      
      {/* Glass card with Avengers styling */}
      <div className="glass-card rounded-2xl p-8 w-full max-w-md shadow-xl border-primary/20 avengers-card">
        <AuthForm 
          mode={mode} 
          onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')} 
        />
      </div>
      
      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-arc-blue animate-arc-pulse" />
        {missionMessages.authFooter}
      </p>
    </div>
  );
}
