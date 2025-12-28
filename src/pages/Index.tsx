import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { WelcomeVideo } from '@/components/auth/WelcomeVideo';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const [videoComplete, setVideoComplete] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in → go to auth
        navigate('/auth', { replace: true });
      } else if (profile) {
        if (!profile.profile_completed) {
          // First time user → complete profile
          navigate('/complete-profile', { replace: true });
        } else if (!videoComplete) {
          // Returning user → show welcome video first
          setShowVideo(true);
        } else {
          // Video complete → go to dashboard
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [user, profile, loading, navigate, videoComplete]);

  const handleVideoComplete = () => {
    setVideoComplete(true);
    setShowVideo(false);
    navigate('/dashboard', { replace: true });
  };

  // Show Avengers welcome video for returning users
  if (showVideo && profile?.profile_completed) {
    return <WelcomeVideo onComplete={handleVideoComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Initializing Avengers HQ...</p>
      </div>
    </div>
  );
};

export default Index;
