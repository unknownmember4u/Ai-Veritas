import { useState, useRef, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';

interface InputTerminalProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  progress: { stage: string; percent: number; detail?: string };
}

export const InputTerminal = ({ onSubmit, isLoading, progress }: InputTerminalProps) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = 999;

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 288); // max 12 rows
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (!text.trim() || isLoading) return;
    onSubmit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Terminal header */}
      <div className="border-2 border-border bg-card/80 backdrop-blur-sm relative">
        {/* Corner brackets */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary/50" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary/50" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary/50" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary/50" />

        {/* Command line */}
        <div className="px-4 py-2 border-b border-border bg-secondary/30">
          <code className="text-sm text-muted-foreground">
            <span className="text-primary">$</span> ANALYZE_CONTENT --input=stdin --verify=true
          </code>
        </div>

        {/* Textarea area */}
        <div className={`relative transition-all duration-300 ${isFocused ? 'ring-2 ring-accent ring-inset' : ''}`}>
          {/* Scan lines overlay */}
          <div className="absolute inset-0 scanlines pointer-events-none opacity-50" />
          
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxChars))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="paste_ai_output_here..."
            disabled={isLoading}
            className="w-full min-h-[192px] p-4 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none font-mono text-sm leading-relaxed disabled:opacity-50"
            aria-label="AI content to verify"
          />

          {/* Blinking cursor overlay when focused */}
          {isFocused && !text && (
            <div className="absolute top-4 left-4 pointer-events-none">
              <span className="text-primary animate-type-cursor">▌</span>
            </div>
          )}
        </div>

        {/* Footer with char count */}
        <div className="px-4 py-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>&gt; Ctrl+Enter to submit</span>
          <span className={text.length >= maxChars * 0.9 ? 'text-warning' : ''}>
            {text.length.toLocaleString()} / {maxChars.toLocaleString()} chars
          </span>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className={`
            relative px-8 py-4 font-bold text-sm uppercase tracking-widest
            border-2 transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isLoading 
              ? 'border-accent bg-accent/10 text-accent' 
              : 'border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:glow-green hover:-translate-y-1'
            }
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
            hex-button
          `}
          style={{
            clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)',
          }}
          aria-label={isLoading ? 'Analyzing content' : 'Run verification protocol'}
        >
          {/* Pulsing glow effect when idle */}
          {!isLoading && text.trim() && (
            <div className="absolute inset-0 bg-primary/20 animate-pulse rounded-sm" style={{
              clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)',
            }} />
          )}
          
          <span className="relative flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                ANALYZING...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                RUN VERIFICATION PROTOCOL
              </>
            )}
          </span>
        </button>

        {/* Progress bar */}
        {isLoading && (
          <div className="w-full max-w-md space-y-2">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 progress-glow"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress.stage}</span>
              <span>{progress.detail}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
