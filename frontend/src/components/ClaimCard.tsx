import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle, ChevronDown, ExternalLink, Copy, BarChart, ShieldAlert, Check } from 'lucide-react';
import { Claim } from '@/components/Dashboard';
import { useToast } from "@/hooks/use-toast";

interface ClaimCardProps {
  claim: Claim;
  index: number;
}

export const ClaimCard = ({ claim, index }: ClaimCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  // 🛡️ CRASH PREVENTION: Normalize status to ensure it matches our keys
  // If backend sends "Verified" (capitalized) or null, this fixes it.
  const rawStatus = claim.status ? claim.status.toLowerCase() : 'inconclusive';
  
  // Define valid keys to make TypeScript happy and fallback safely
  type StatusKey = 'verified' | 'contradicted' | 'inconclusive';
  const validStatus: StatusKey = ['verified', 'contradicted', 'inconclusive'].includes(rawStatus) 
    ? (rawStatus as StatusKey) 
    : 'inconclusive';

  const statusConfig = {
    verified: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500',
      textColor: 'text-green-500',
      label: 'VERIFIED',
      glow: 'shadow-[0_0_15px_rgba(34,197,94,0.2)]',
    },
    contradicted: {
      icon: XCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500',
      textColor: 'text-red-500',
      label: 'CONTRADICTED',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    },
    inconclusive: {
      icon: HelpCircle,
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-500',
      label: 'INCONCLUSIVE',
      glow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]',
    },
  };

  // Safe access guaranteed
  const config = statusConfig[validStatus];
  const StatusIcon = config.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Claim: "${claim.original_text}"\nStatus: ${validStatus.toUpperCase()}\nReasoning: ${claim.reasoning}\nSource: ${claim.source_url}`);
    setIsCopied(true);
    toast({
      title: "Analysis Copied",
      description: "Claim details copied to clipboard",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      // 🛡️ REMOVED 'layout' prop here. It causes the black screen crash in Grids.
      className={`relative overflow-hidden rounded-lg border-2 ${config.borderColor} ${config.bgColor} ${config.glow} backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_25px_rgba(var(--cyber-color),0.3)] h-fit`}
      style={{ '--cyber-color': config.textColor.replace('text-', '') } as React.CSSProperties}
    >
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-scanline opacity-5"></div>
      
      <div className="p-4 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${config.bgColor} border ${config.borderColor} shrink-0`}>
            <StatusIcon className={`w-4 h-4 ${config.textColor} animate-pulse-subtle`} />
            <span className={`text-xs font-bold tracking-wider ${config.textColor}`}>
              {config.label}
            </span>
          </div>
          
          <div className="flex flex-col items-end gap-1 ml-auto shrink-0">
            <div className="flex items-center gap-1.5 font-mono text-xs whitespace-nowrap">
              <BarChart className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Confidence:</span>
              <span className={`font-bold ${config.textColor}`}>
                {claim.confidence_score}%
              </span>
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-1 text-xs font-mono ${config.textColor} hover:underline focus:outline-none group whitespace-nowrap`}
            >
              {isExpanded ? 'COLLAPSE' : 'EXPAND'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Claim Text */}
        <p className="font-mono text-sm md:text-base mb-3 line-clamp-2 leading-relaxed">
          "{claim.original_text}"
        </p>

        {/* Expanded Content */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-border/50 space-y-3">
                <div className="max-h-[250px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-black [&::-webkit-scrollbar-thumb]:bg-zinc-800 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
                    <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Analysis</h4>
                  </div>
                  
                  <div className="pl-2 border-l-2 border-border/60">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {claim.reasoning}
                    </p>
                  </div>
                  
                  {claim.evidence_source && (
                    <div className="mt-3 pl-2 border-l-2 border-border/60">
                      <p className="text-xs text-muted-foreground/80 italic line-clamp-3">
                        "{claim.evidence_source}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  {claim.source_url ? (
                    <a
                      href={claim.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline truncate max-w-[70%] group transition-colors shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span className="truncate">{new URL(claim.source_url).hostname}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      No source provided
                    </span>
                  )}
                  
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/20 focus:outline-none focus:ring-1 focus:ring-ring"
                    title="Copy analysis"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};