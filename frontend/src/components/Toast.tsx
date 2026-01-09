import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, X, RotateCcw } from 'lucide-react';

type ToastType = 'error' | 'warning' | 'success';

interface ToastProps {
  type: ToastType;
  title: string;
  message: string;
  details?: string[];
  onDismiss: () => void;
  onRetry?: () => void;
  duration?: number;
}

export const Toast = ({ 
  type, 
  title, 
  message, 
  details, 
  onDismiss, 
  onRetry,
  duration = 8000 
}: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  const getConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: AlertCircle,
          borderClass: 'border-destructive',
          bgClass: 'bg-destructive/10',
          iconClass: 'text-destructive',
          glowClass: 'glow-pink',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          borderClass: 'border-warning',
          bgClass: 'bg-warning/10',
          iconClass: 'text-warning',
          glowClass: 'glow-amber',
        };
      case 'success':
        return {
          icon: CheckCircle,
          borderClass: 'border-primary',
          bgClass: 'bg-primary/10',
          iconClass: 'text-primary',
          glowClass: 'glow-green',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div 
      className={`
        fixed top-4 right-4 z-50 w-full max-w-md
        border-2 ${config.borderClass} ${config.bgClass}
        bg-card/95 backdrop-blur-md
        animate-bounce-in
        ${isExiting ? 'opacity-0 translate-x-full transition-all duration-300' : ''}
        ${config.glowClass}
      `}
      role="alert"
      aria-live="assertive"
    >
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconClass}`} />
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-sm uppercase tracking-wider ${config.iconClass}`}>
              {title}
            </h4>
            <div className="mt-1 border-t border-border/50 pt-1">
              <p className="text-sm text-foreground/80">{message}</p>
              
              {details && details.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons */}
        {onRetry && (
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={onRetry}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border ${config.borderClass} ${config.iconClass} hover:${config.bgClass} transition-colors`}
            >
              <RotateCcw className="w-3 h-3" />
              RETRY
            </button>
          </div>
        )}
      </div>

      {/* Countdown bar */}
      <div className="h-1 bg-muted overflow-hidden">
        <div 
          className={`h-full ${config.iconClass} bg-current animate-progress-bar`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
};
