import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface InfinityStone {
  id: number;
  color: string;
  x: number;
  y: number;
  delay: number;
}

const stoneColors = [
  'bg-thanos-purple', // Power
  'bg-captain-blue',  // Space
  'bg-avengers-red',  // Reality
  'bg-infinity-gold', // Soul
  'bg-hulk-green',    // Time
  'bg-warning',       // Mind
];

export function AuthBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [stones, setStones] = useState<InfinityStone[]>([]);
  const [lightning, setLightning] = useState(false);

  useEffect(() => {
    // Generate stars
    const generatedStars: Star[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
    }));
    setStars(generatedStars);

    // Generate infinity stones
    const generatedStones: InfinityStone[] = stoneColors.map((color, i) => ({
      id: i,
      color,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      delay: i * 0.5,
    }));
    setStones(generatedStones);

    // Random lightning effect
    const lightningInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLightning(true);
        setTimeout(() => setLightning(false), 200);
      }
    }, 5000);

    return () => clearInterval(lightningInterval);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base dark space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      
      {/* Star field */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-foreground/60"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `starTwinkle ${2 + star.delay}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Floating Infinity Stones */}
      {stones.map((stone) => (
        <div
          key={stone.id}
          className={`absolute w-3 h-3 rounded-full ${stone.color} opacity-60 animate-infinity-float blur-[1px]`}
          style={{
            left: `${stone.x}%`,
            top: `${stone.y}%`,
            animationDelay: `${stone.delay}s`,
            boxShadow: `0 0 20px currentColor`,
          }}
        />
      ))}
      
      {/* Animated gradient orbs - Avengers themed */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float" />
      <div 
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-arc-blue/15 rounded-full blur-3xl animate-float" 
        style={{ animationDelay: '-3s' }} 
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      {/* Thor lightning flash */}
      {lightning && (
        <div className="absolute inset-0 bg-arc-blue/10 animate-lightning pointer-events-none" />
      )}
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/80" />
    </div>
  );
}
