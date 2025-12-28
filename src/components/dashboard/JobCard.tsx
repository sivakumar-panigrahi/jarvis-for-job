import { useState, useEffect, useCallback } from 'react';
import { Clock, Building2, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/hooks/useCountdown';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { missionMessages } from '@/lib/hero-quotes';
import { ApplyVideoOverlay } from './ApplyVideoOverlay';

interface JobCardProps {
  id: string;
  companyName: string;
  jobTitle: string;
  applyUrl: string;
  expiresAt: Date;
  userId?: string;
}

export function JobCard({ id, companyName, jobTitle, applyUrl, expiresAt, userId }: JobCardProps) {
  const { hours, minutes, isExpired } = useCountdown(expiresAt);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const { toast } = useToast();

  // Check if user has already applied to this job
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!userId) return;
      
      const { data } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', userId)
        .eq('job_id', id)
        .maybeSingle();
      
      if (data) {
        setHasApplied(true);
      }
    };

    checkApplicationStatus();
  }, [userId, id]);

  const handleVideoComplete = useCallback(() => {
    setShowVideo(false);
    // Redirect after video ends
    window.open(applyUrl, '_blank', 'noopener,noreferrer');
  }, [applyUrl]);

  const handleApply = async () => {
    // Track the application if user is logged in and hasn't applied yet
    if (userId && !hasApplied) {
      setIsApplying(true);
      try {
        const { error } = await supabase
          .from('job_applications')
          .insert({
            user_id: userId,
            job_id: id,
            job_title: jobTitle,
            company_name: companyName,
          });

        if (error) {
          // If it's a duplicate, just mark as applied
          if (error.code === '23505') {
            setHasApplied(true);
          } else {
            console.error('Error tracking application:', error);
          }
        } else {
          setHasApplied(true);
          toast({
            title: '🎯 Mission Accepted!',
            description: `Your mission to ${companyName} has been logged, Agent.`,
          });
        }
      } catch (error) {
        console.error('Error tracking application:', error);
      } finally {
        setIsApplying(false);
      }
    }

    // Show video before redirecting
    setShowVideo(true);
  };

  const getTimeUrgency = () => {
    if (isExpired) return 'text-destructive';
    if (hours < 6) return 'text-warning';
    return 'text-muted-foreground';
  };

  if (isExpired) return null;

  return (
    <>
      {showVideo && <ApplyVideoOverlay onComplete={handleVideoComplete} />}
      
      <div className="glass-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group avengers-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Company Name */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 group-hover:animate-repulsor">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                  {companyName}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{jobTitle}</p>
              </div>
            </div>

            {/* Time remaining */}
            <div className={`flex items-center gap-1.5 text-sm ${getTimeUrgency()}`}>
              <Clock className="h-4 w-4" />
              <span>
                Mission window: {hours}h {minutes}m remaining
              </span>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={handleApply}
              className="flex-shrink-0 gap-2 bg-primary hover:bg-primary/90"
              size="sm"
              disabled={isApplying}
            >
              {hasApplied ? missionMessages.applied : missionMessages.apply}
              {hasApplied ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
            </Button>
            {hasApplied && (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {missionMessages.tracked}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
