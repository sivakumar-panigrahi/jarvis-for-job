import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, AlertTriangle, Briefcase, Zap, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { CountdownTimer } from '@/components/dashboard/CountdownTimer';
import { JobCard } from '@/components/dashboard/JobCard';
import { supabase } from '@/integrations/supabase/client';
import { getRandomQuote, missionMessages } from '@/lib/hero-quotes';

interface Job {
  id: string;
  company_name: string;
  job_title: string;
  apply_url: string;
  expires_at: string;
  posted_at: string;
}

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [heroQuote] = useState(() => getRandomQuote());

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth', { replace: true });
      } else if (profile && !profile.profile_completed) {
        navigate('/complete-profile', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  // Fetch active jobs
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: true });

        if (error) throw error;
        setJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
    
    // Refresh jobs every minute
    const interval = setInterval(fetchJobs, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  // Get the soonest expiring job for the main timer
  const nextExpiringJob = useMemo(() => {
    if (jobs.length === 0) return null;
    return jobs[0]; // Already sorted by expires_at ascending
  }, [jobs]);

  const countdownTarget = useMemo(() => {
    if (!nextExpiringJob) return null;
    return new Date(nextExpiringJob.expires_at);
  }, [nextExpiringJob]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading mission data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <AuthBackground />

      <div className="max-w-5xl mx-auto">
        {/* Header - Avengers HQ */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-repulsor">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">{missionMessages.dashboard}</span>
              <p className="text-xs text-muted-foreground">{missionMessages.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate('/admin/jobs')}
                className="bg-primary hover:bg-primary/90"
              >
                <Settings className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Manage Missions</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/profile')}
              className="gap-2 border-primary/30 hover:bg-primary/10"
            >
              <User className="h-4 w-4" />
              <span className="hidden md:inline">{missionMessages.profile}</span>
            </Button>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {profile.full_name?.charAt(0) || profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-muted-foreground">
                Agent {profile.full_name || profile.username}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-primary/30 hover:bg-primary/10">
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{missionMessages.signOut}</span>
            </Button>
          </div>
        </header>

        {/* Hero Section - Countdown Timer with Avengers Theme */}
        <div className="glass-card rounded-2xl p-8 md:p-12 mb-8 animate-slide-up text-center relative overflow-hidden avengers-card">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-arc-blue/10 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-6 w-6 text-warning animate-pulse" />
              <h2 className="text-lg md:text-xl font-semibold text-warning">
                {missionMessages.timeSensitive}
              </h2>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-6">
              {nextExpiringJob ? (
                <>{missionMessages.nextExpires}</>
              ) : (
                <>{missionMessages.noActive}</>
              )}
            </h1>

            {/* Countdown Timer */}
            {nextExpiringJob ? (
              <div className="mb-8">
                <CountdownTimer targetDate={countdownTarget} />
              </div>
            ) : (
              <div className="py-8 text-muted-foreground">
                <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>{missionMessages.checkBack}</p>
              </div>
            )}

            {/* Warning Note */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/30 text-warning text-sm md:text-base">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{missionMessages.jobsExpire}</span>
            </div>
          </div>
        </div>

        {/* Active Jobs List */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              {missionMessages.activeJobs} 🦅
              <span className="text-sm font-normal text-muted-foreground">
                ({jobs.length} available)
              </span>
            </h2>
          </div>

          {jobsLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted" />
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-muted rounded mb-2" />
                      <div className="h-4 w-24 bg-muted rounded" />
                    </div>
                    <div className="h-9 w-20 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid gap-4">
              {jobs.map((job, index) => (
                <div 
                  key={job.id} 
                  className="animate-assemble"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <JobCard
                    id={job.id}
                    companyName={job.company_name}
                    jobTitle={job.job_title}
                    applyUrl={job.apply_url}
                    expiresAt={new Date(job.expires_at)}
                    userId={user?.id}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">{missionMessages.noActive}</h3>
              <p className="text-muted-foreground">
                {missionMessages.noJobs}
              </p>
            </div>
          )}
        </div>

        {/* Footer - Random Avengers Quote */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground italic">
            "{heroQuote.quote}"
          </p>
          <p className="text-xs text-primary mt-1">— {heroQuote.hero}</p>
        </div>
      </div>
    </div>
  );
}
