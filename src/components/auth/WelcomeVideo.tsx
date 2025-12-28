import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeVideoProps {
  onComplete: () => void;
}

export function WelcomeVideo({ onComplete }: WelcomeVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSoundPrompt, setShowSoundPrompt] = useState(true); // Always show initially

  const enableSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      console.log('Video ref not found');
      return;
    }

    console.log('Enabling sound...');
    console.log('Before - muted:', video.muted, 'volume:', video.volume, 'paused:', video.paused);

    // Unmute and set volume
    video.muted = false;
    video.volume = 1.0;
    
    // Update state
    setIsMuted(false);
    setShowSoundPrompt(false);

    // Play with sound
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('After - muted:', video.muted, 'volume:', video.volume, 'paused:', video.paused);
          console.log('Video playing with sound successfully!');
        })
        .catch((error) => {
          console.error('Play failed:', error);
        });
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('Video element initialized');

    // Start muted to ensure autoplay works
    video.muted = true;
    video.volume = 1.0;
    setIsMuted(true);

    // Try to play (will work because muted)
    video.play().then(() => {
      console.log('Video started playing (muted)');
    }).catch((error) => {
      console.error('Initial play failed:', error);
    });

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      onComplete();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onComplete]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !video.muted;
    video.muted = newMuted;
    video.volume = 1.0;
    setIsMuted(newMuted);
    
    console.log('Toggle mute - muted:', newMuted, 'volume:', video.volume);
    
    if (!newMuted) {
      video.play().catch(console.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        preload="auto"
      >
        <source src="/videos/avengers-welcome.mp4" type="video/mp4" />
      </video>

      {/* Sound prompt overlay - user must tap to enable sound */}
      {showSoundPrompt && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={enableSound}
          onTouchEnd={(e) => {
            e.preventDefault();
            enableSound();
          }}
        >
          <div className="bg-avengers-red px-8 py-6 rounded-xl flex items-center gap-4 hover:scale-105 transition-transform shadow-2xl border-2 border-white/20 animate-bounce">
            <Volume2 className="h-10 w-10 text-white" />
            <span className="text-white font-bold text-2xl tracking-wide">🔊 TAP TO ENABLE SOUND</span>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-avengers-red rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Mute button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-white hover:bg-white/20"
          >
            {isMuted ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>

          {/* Skip button */}
          <Button
            variant="ghost"
            onClick={onComplete}
            className="text-white hover:bg-white/20 gap-2"
          >
            Skip
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Avengers logo text */}
      <div className="absolute top-6 left-6 text-white font-bold text-xl tracking-wider animate-pulse">
        AVENGERS HQ
      </div>
    </div>
  );
}
