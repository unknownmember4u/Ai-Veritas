import { useState, useEffect } from 'react';
import { Zap, Terminal, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isOnline: boolean;
  latency: number;
  verifiedCount: number;
}

export const Header = ({ isOnline, latency, verifiedCount }: HeaderProps) => {
  const [isDark, setIsDark] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('ai-veritas-theme');
    const prefersDark = savedTheme ? savedTheme === 'dark' : true;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle('light', !prefersDark);
  }, []);

  const toggleTheme = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setIsDark(prev => {
        const newValue = !prev;
        localStorage.setItem('ai-veritas-theme', newValue ? 'dark' : 'light');
        document.documentElement.classList.toggle('light', !newValue);
        return newValue;
      });
      setIsFlipping(false);
    }, 250);
  };

  return (
    <header className="relative border-2 border-border bg-card/80 backdrop-blur-sm">
      {/* Corner brackets */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />

      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/30 -z-10" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary text-glow-green tracking-wider">
                AI VERITAS <span className="text-muted-foreground text-sm">v2.0</span>
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="text-primary">&gt;</span>
                Explainable AI Hallucination Detection System
              </p>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-6">
            {/* Online status */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className={`flex items-center gap-1.5 ${isOnline ? 'text-primary' : 'text-destructive'}`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            {/* Latency */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Latency:</span>
              <span className="text-accent">{latency}ms</span>
            </div>

            {/* Verified count */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Verified:</span>
              <span className="text-primary">{verifiedCount.toLocaleString()}</span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-8 rounded-full border-2 border-primary bg-secondary transition-all duration-300 hover:glow-green focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${isFlipping ? 'scale-95' : ''}`}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center transition-all duration-500 ${isDark ? 'left-1' : 'left-7'} ${isFlipping ? 'rotate-180' : ''}`}
              >
                {isDark ? (
                  <Terminal className="w-3 h-3 text-primary-foreground" />
                ) : (
                  <Sun className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              {/* Spark effect */}
              {isFlipping && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-spark" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Typing cursor indicator */}
{/* Typing cursor indicator */}
        {/* Solid State Neon Effect */}
<div className="mt-3 flex items-center gap-2 text-xs font-mono">
  <span className="text-muted-foreground">&gt;</span>
  
        <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
          </span>
          <span className="text-primary tracking-wider font-bold drop-shadow-[0_0_3px_rgba(34,197,94,0.5)]">
            SYSTEM_READY
          </span>
        </div>
      </div>
      </div>
    </header>
  );
};
