import { useRef, useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';

interface ProfileCompleteVideoProps {
  onComplete: () => void;
}

export const ProfileCompleteVideo = ({ onComplete }: ProfileCompleteVideoProps) => {
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
      video.play().catch(console.error);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
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
      if (isMuted) {
        video.muted = false;
        video.volume = 1.0;
        setIsMuted(false);
        setShowSoundPrompt(false);
      } else {
        video.muted = true;
        setIsMuted(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      >
        <source src="/videos/batman-welcome.mp4" type="video/mp4" />
      </video>

      {/* Sound prompt overlay */}
      {showSoundPrompt && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10"
          onClick={enableSound}
          onTouchEnd={enableSound}
        >
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
              <Volume2 className="w-10 h-10 text-amber-400" />
            </div>
            <span className="text-amber-400 text-lg font-bold tracking-wider">
              🔊 TAP TO ENABLE SOUND
            </span>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className="p-3 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <span className="text-amber-400/80 text-sm font-medium tracking-widest">
              GOTHAM CITY
            </span>
          </div>

          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-colors font-medium"
          >
            Skip <SkipForward className="w-4 h-4" />
          </button>
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
};
