import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowLeft, Edit, Briefcase, Calendar,
  GraduationCap, Phone, Github, FileText, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { JobApplicationsBento } from '@/components/profile/JobApplicationsBento';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { supabase } from '@/integrations/supabase/client';
import { missionMessages } from '@/lib/hero-quotes';

interface JobApplication {
  id: string;
  job_title: string;
  company_name: string;
  applied_at: string;
}

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('applied_at', { ascending: false });
        if (error) throw error;
        setApplications(data || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setApplicationsLoading(false);
      }
    };
    if (user) fetchApplications();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 py-8">
      <AuthBackground />
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to HQ
          </Button>
          <Button onClick={() => navigate('/profile/edit')} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in avengers-card">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="h-24 w-24 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center flex-shrink-0 animate-repulsor">
              <span className="text-4xl font-bold text-primary">
                {profile?.full_name?.charAt(0).toUpperCase() || profile?.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {profile?.full_name || 'Agent'}
                </h1>
                <p className="text-primary">@{profile?.username}</p>
                <p className="text-muted-foreground">{profile?.email}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.date_of_birth && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(profile.date_of_birth), 'PPP')}</span>
                  </div>
                )}
                {profile?.github_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">GitHub Profile</a>
                  </div>
                )}
                {profile?.resume_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Resume</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 animate-fade-in avengers-card">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-primary" />
            {missionMessages.education}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">College</p><p className="font-medium">{profile?.college_name || 'Not set'}</p></div>
            <div><p className="text-sm text-muted-foreground">Department</p><p className="font-medium">{profile?.department || 'Not set'}</p></div>
            <div><p className="text-sm text-muted-foreground">Qualification</p><p className="font-medium">{profile?.qualification || 'Not set'}</p></div>
            <div><p className="text-sm text-muted-foreground">Year of Passout</p><p className="font-medium">{profile?.year_of_passout || 'Not set'}</p></div>
            <div><p className="text-sm text-muted-foreground">Graduation Percentage</p><p className="font-medium">{profile?.graduation_percentage ? `${profile.graduation_percentage}%` : 'Not set'}</p></div>
          </div>
          {profile?.skills && profile.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">{missionMessages.skills} 💪</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              {missionMessages.applications}
            </h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-semibold text-primary">{applications.length} Missions</span>
            </div>
          </div>
          <JobApplicationsBento applications={applications} loading={applicationsLoading} />
        </div>
      </div>
    </div>
  );
}
