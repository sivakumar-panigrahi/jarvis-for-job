import { useCountdown } from '@/hooks/useCountdown';

interface CountdownTimerProps {
  targetDate: Date | null;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const { hours, minutes, seconds, milliseconds, isExpired } = useCountdown(targetDate);

  const formatNumber = (num: number, digits: number = 2) => {
    return num.toString().padStart(digits, '0');
  };

  if (isExpired) {
    return (
      <div className="text-center">
        <div className="text-4xl md:text-6xl font-mono font-bold text-destructive">
          EXPIRED
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {/* Hours */}
      <div className="flex flex-col items-center">
        <div className="bg-secondary/80 backdrop-blur-sm rounded-xl px-4 py-3 md:px-6 md:py-4 border border-primary/20 shadow-lg">
          <span className="text-3xl md:text-5xl lg:text-6xl font-mono font-bold text-primary tabular-nums">
            {formatNumber(hours)}
          </span>
        </div>
        <span className="text-xs md:text-sm text-muted-foreground mt-2 uppercase tracking-wider">Hours</span>
      </div>

      <span className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary/50 -mt-6">:</span>

      {/* Minutes */}
      <div className="flex flex-col items-center">
        <div className="bg-secondary/80 backdrop-blur-sm rounded-xl px-4 py-3 md:px-6 md:py-4 border border-primary/20 shadow-lg">
          <span className="text-3xl md:text-5xl lg:text-6xl font-mono font-bold text-primary tabular-nums">
            {formatNumber(minutes)}
          </span>
        </div>
        <span className="text-xs md:text-sm text-muted-foreground mt-2 uppercase tracking-wider">Minutes</span>
      </div>

      <span className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary/50 -mt-6">:</span>

      {/* Seconds */}
      <div className="flex flex-col items-center">
        <div className="bg-secondary/80 backdrop-blur-sm rounded-xl px-4 py-3 md:px-6 md:py-4 border border-primary/20 shadow-lg">
          <span className="text-3xl md:text-5xl lg:text-6xl font-mono font-bold text-primary tabular-nums">
            {formatNumber(seconds)}
          </span>
        </div>
        <span className="text-xs md:text-sm text-muted-foreground mt-2 uppercase tracking-wider">Seconds</span>
      </div>

      <span className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary/50 -mt-6">:</span>

      {/* Milliseconds */}
      <div className="flex flex-col items-center">
        <div className="bg-secondary/80 backdrop-blur-sm rounded-xl px-4 py-3 md:px-6 md:py-4 border border-accent/30 shadow-lg">
          <span className="text-3xl md:text-5xl lg:text-6xl font-mono font-bold text-accent tabular-nums">
            {formatNumber(milliseconds)}
          </span>
        </div>
        <span className="text-xs md:text-sm text-muted-foreground mt-2 uppercase tracking-wider">MS</span>
      </div>
    </div>
  );
}
