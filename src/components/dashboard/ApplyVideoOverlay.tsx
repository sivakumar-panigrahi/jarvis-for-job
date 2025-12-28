import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX } from 'lucide-react';

interface ApplyVideoOverlayProps {
  onComplete: () => void;
}

export const ApplyVideoOverlay = ({ onComplete }: ApplyVideoOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showSoundPrompt, setShowSoundPrompt] = useState(true);

  const enableSound = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 1.0;
      setIsMuted(false);
      setShowSoundPrompt(false);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start muted (browsers require this), user will tap to enable sound
    video.muted = true;
    video.volume = 1.0;
    video.play().catch(console.error);

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
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
      if (!video.muted) {
        setShowSoundPrompt(false);
      }
    }
  };

  const overlay = (
    <div 
      className="fixed inset-0 bg-black"
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        playsInline
        autoPlay
      >
        <source src="/videos/batman-welcome.mp4" type="video/mp4" />
      </video>

      {/* Sound prompt overlay */}
      {showSoundPrompt && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer"
          style={{ zIndex: 100000 }}
          onClick={enableSound}
        >
          <div className="text-center animate-pulse">
            <Volume2 className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <p className="text-amber-400 text-xl font-bold tracking-widest uppercase">
              TAP TO ENABLE SOUND
            </p>
          </div>
        </div>
      )}

      {/* Controls overlay - only mute button, no skip */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
        style={{ zIndex: 100001 }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className="p-3 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <span className="text-amber-400/80 text-sm font-medium tracking-widest uppercase">
              GOTHAM CITY
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-amber-500/20 rounded-full overflow-hidden max-w-4xl mx-auto">
          <div 
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Use portal to render at document body level for true full screen
  return createPortal(overlay, document.body);
};
