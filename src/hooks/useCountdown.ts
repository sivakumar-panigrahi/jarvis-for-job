import { useState, useEffect, useCallback } from 'react';

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  isExpired: boolean;
}

export function useCountdown(targetDate: Date | null): CountdownTime {
  const calculateTimeLeft = useCallback((): CountdownTime => {
    if (!targetDate) {
      return { hours: 0, minutes: 0, seconds: 0, milliseconds: 0, isExpired: true };
    }

    const now = new Date().getTime();
    const target = targetDate.getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, milliseconds: 0, isExpired: true };
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const milliseconds = Math.floor((difference % 1000) / 10); // Show only 2 digits

    return { hours, minutes, seconds, milliseconds, isExpired: false };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<CountdownTime>(calculateTimeLeft);

  useEffect(() => {
    if (!targetDate) return;

    // Update every 10ms for smooth milliseconds display
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 10);

    return () => clearInterval(interval);
  }, [targetDate, calculateTimeLeft]);

  return timeLeft;
}
