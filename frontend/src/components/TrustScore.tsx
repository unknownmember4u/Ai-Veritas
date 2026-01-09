import { useEffect, useState, useRef } from 'react';

interface TrustScoreProps {
  score: number;
  totalClaims: number;
  verifiedClaims: number;
  hallucinationsDetected: number;
}

export const TrustScore = ({ score, totalClaims, verifiedClaims, hallucinationsDetected }: TrustScoreProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showParticles, setShowParticles] = useState(false);
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  // Animate score number
  useEffect(() => {
    setIsAnimating(true);
    setDisplayScore(0);
    
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = score / steps;
    
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
        setIsAnimating(false);
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 1000);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [score]);

  // Get color based on score
  const getScoreColor = () => {
    if (score >= 90) return { stroke: 'hsl(var(--primary))', class: 'text-primary text-glow-green' };
    if (score >= 70) return { stroke: 'hsl(153 80% 45%)', class: 'text-primary' };
    if (score >= 40) return { stroke: 'hsl(var(--warning))', class: 'text-warning' };
    return { stroke: 'hsl(var(--destructive))', class: 'text-destructive' };
  };

  const colorConfig = getScoreColor();

  // Get status text
  const getStatusText = () => {
    if (score >= 90) return 'HIGHLY VERIFIED';
    if (score >= 70) return 'HIGH CONFIDENCE';
    if (score >= 40) return 'MODERATE CONFIDENCE';
    return 'LOW CONFIDENCE';
  };

  return (
    <div className="relative border-2 border-border bg-card/80 backdrop-blur-sm p-6 md:p-8">
      {/* Corner brackets */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />

      {/* Title */}
      <h2 className="text-center text-lg font-bold text-primary mb-6 tracking-wider">
        VERIFICATION COMPLETE
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Circular progress */}
        <div className="relative">
          {/* Glow effect */}
          <div 
            className="absolute inset-0 blur-2xl opacity-30"
            style={{ backgroundColor: colorConfig.stroke }}
          />
          
          <svg width="180" height="180" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke={colorConfig.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={isAnimating ? circumference : strokeDashoffset}
              className="transition-all duration-[2000ms] ease-out"
              style={{
                filter: score >= 70 ? `drop-shadow(0 0 10px ${colorConfig.stroke})` : undefined
              }}
            />
          </svg>
          
          {/* Score number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold tabular-nums ${colorConfig.class}`}>
              {displayScore}
            </span>
            <span className="text-muted-foreground text-lg">/100</span>
          </div>

          {/* Particles burst */}
          {showParticles && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full animate-confetti"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-60px)`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-4 text-center md:text-left">
          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 border-2 ${
            score >= 70 ? 'border-primary bg-primary/10' : 
            score >= 40 ? 'border-warning bg-warning/10' : 
            'border-destructive bg-destructive/10'
          }`}>
            <span className={`w-3 h-3 rounded-sm ${
              score >= 70 ? 'bg-primary' : 
              score >= 40 ? 'bg-warning animate-pulse' : 
              'bg-destructive animate-pulse'
            }`} />
            <span className={`font-bold text-sm tracking-wider ${colorConfig.class}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Detailed stats */}
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">CLAIMS VERIFIED:</span>
              <span className="text-primary">{verifiedClaims}/{totalClaims}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">HALLUCINATIONS DETECTED:</span>
              <span className={hallucinationsDetected > 0 ? 'text-destructive' : 'text-primary'}>
                {hallucinationsDetected}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
