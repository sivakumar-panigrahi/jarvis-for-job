import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Shield, Plus, Loader2, ExternalLink, Trash2, 
  Building2, Link as LinkIcon, Clock, ShieldAlert 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const jobSchema = z.object({
  company_name: z.string().min(2, 'Company name is required').max(100),
  job_title: z.string().min(2, 'Job title is required').max(200),
  apply_url: z.string().url('Please enter a valid URL'),
});

type JobFormData = z.infer<typeof jobSchema>;

interface Job {
  id: string;
  company_name: string;
  job_title: string;
  apply_url: string;
  expires_at: string;
  is_active: boolean;
}

export default function AdminJobs() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      company_name: '',
      job_title: '',
      apply_url: '',
    },
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate('/auth', { replace: true });
      } else if (!isAdmin) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  // Fetch all jobs (including inactive)
  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchJobs();
    }
  }, [isAdmin]);

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('jobs').insert({
        company_name: data.company_name,
        job_title: data.job_title,
        apply_url: data.apply_url,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: 'Job posted!',
        description: 'The job will be visible for 24 hours.',
      });

      form.reset();
      fetchJobs();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to post job',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    setIsDeleting(jobId);
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: 'Job deleted',
        description: 'The job has been removed.',
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete job',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <AuthBackground />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <span className="text-xl font-bold text-destructive">Admin Panel</span>
              <p className="text-xs text-muted-foreground">Job Management</p>
            </div>
          </div>

          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </header>

        {/* Add Job Form */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-slide-up">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Post New Job
          </h2>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Name
                </Label>
                <Input
                  id="company_name"
                  placeholder="e.g., Google"
                  {...form.register('company_name')}
                  className={cn(
                    form.formState.errors.company_name && 'border-destructive'
                  )}
                />
                {form.formState.errors.company_name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.company_name.message}
                  </p>
                )}
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  placeholder="e.g., Software Engineer"
                  {...form.register('job_title')}
                  className={cn(
                    form.formState.errors.job_title && 'border-destructive'
                  )}
                />
                {form.formState.errors.job_title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.job_title.message}
                  </p>
                )}
              </div>
            </div>

            {/* Apply URL */}
            <div className="space-y-2">
              <Label htmlFor="apply_url" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Apply Link
              </Label>
              <Input
                id="apply_url"
                type="url"
                placeholder="https://careers.company.com/apply"
                {...form.register('apply_url')}
                className={cn(
                  form.formState.errors.apply_url && 'border-destructive'
                )}
              />
              {form.formState.errors.apply_url && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.apply_url.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Job will auto-expire in 24 hours
              </p>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Post Job
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Jobs List */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-semibold mb-4">
            All Jobs ({jobs.length})
          </h2>

          {jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map((job) => {
                const isExpired = new Date(job.expires_at) <= new Date();
                return (
                  <div
                    key={job.id}
                    className={cn(
                      'glass-card rounded-xl p-4 flex items-center justify-between gap-4',
                      isExpired && 'opacity-50'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{job.company_name}</h3>
                        {isExpired && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-destructive/20 text-destructive">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{job.job_title}</p>
                      <p className={cn(
                        'text-xs mt-1',
                        isExpired ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        {getTimeRemaining(job.expires_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(job.apply_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
                        disabled={isDeleting === job.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {isDeleting === job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No jobs posted yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
