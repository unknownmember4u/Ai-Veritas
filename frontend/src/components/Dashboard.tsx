import { useState, useEffect } from 'react';
import { Header } from './Header';
import { InputTerminal } from './InputTerminal';
import { TrustScore } from './TrustScore';
import { ClaimCard } from './ClaimCard';
import { Toast } from './Toast';
import { API_ENDPOINTS } from "@/config"; // ✅ Your config file

// 1. Define Types locally to match your Backend
export interface Claim {
  original_text: string;
  status: "verified" | "contradicted" | "inconclusive";
  confidence_score: number;
  reasoning: string;
  evidence_source: string;
  source_url: string;
}

export interface VerifyResponse {
  overall_trust_score: number;
  claims: Claim[];
}

export const Dashboard = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [latency, setLatency] = useState(24);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0, detail: '' });
  const [results, setResults] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<{ type: 'error' | 'warning'; title: string; message: string; details?: string[] } | null>(null);

  // 2. Real Health Check (Pings your Backend)
  useEffect(() => {
    const performHealthCheck = async () => {
      const start = Date.now();
      try {
        // We ping the verify endpoint with a GET (Backend returns 405 Method Not Allowed, which means it IS online)
        await fetch(API_ENDPOINTS.VERIFY, { method: 'GET' });
        setIsOnline(true);
        setLatency(Date.now() - start);
      } catch (err) {
        console.error("Health Check Failed:", err);
        setIsOnline(false);
      }
    };

    performHealthCheck();
    const interval = setInterval(performHealthCheck, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  // 3. The Real Verification Logic
  const handleVerify = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    // Initial Progress
    setProgress({ stage: 'Initializing Neural Core...', percent: 10, detail: 'Handshaking with Local Host...' });

    try {
      // Simulation: Fake progress updates while waiting (so UI feels alive)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev.percent >= 90) return prev;
          return { 
            stage: 'Analyzing Truth Vectors...', 
            percent: prev.percent + 5, 
            detail: 'Cross-referencing Tavily Knowledge Graph...' 
          };
        });
      }, 800);

      console.log(`📡 Sending to Backend: ${API_ENDPOINTS.VERIFY}`);

      // --- THE REAL API CALL ---
      const response = await fetch(API_ENDPOINTS.VERIFY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' , 'ngrok-skip-browser-warning': '69420' },
        body: JSON.stringify({ text }),
      });

      // Clear the fake progress timer
      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server Error: ${response.status}`);
      }

      const data: VerifyResponse = await response.json();
      console.log("✅ Backend Replied:", data);

      // Finalize Success
      setProgress({ stage: 'Verification Complete', percent: 100, detail: 'Report Generated.' });
      setResults(data);
      setVerifiedCount(prev => prev + data.claims.length);

    } catch (err: any) {
      console.error("❌ Verify Error:", err);
      const message = err.message || 'Unknown error occurred';
      
      let errorDetails = ['Try again in a few moments'];
      if (message.includes("Failed to fetch")) {
        errorDetails = [
          'Is the Backend Terminal running?', 
          'Is Ollama running?', 
          'Check src/config.ts IP address'
        ];
      }

      setError({
        type: 'error',
        title: 'CONNECTION FAILED',
        message: message.includes("Failed to fetch") ? "Could not reach Backend" : message,
        details: errorDetails,
      });
    } finally {
      setIsLoading(false);
      // Reset progress after a delay
      setTimeout(() => setProgress({ stage: '', percent: 0, detail: '' }), 2000);
    }
  };

  // Calculate stats from results
  const stats = results ? {
    totalClaims: results.claims.length,
    verifiedClaims: results.claims.filter(c => c.status === 'verified').length,
    hallucinationsDetected: results.claims.filter(c => c.status === 'contradicted').length,
  } : null;

  return (
    <div className="min-h-screen bg-background grid-bg noise-overlay">
      <div className="relative z-10 container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8 max-w-6xl">
        {/* Header */}
        <Header 
          isOnline={isOnline} 
          latency={latency} 
          verifiedCount={verifiedCount} 
        />

        {/* Input Terminal */}
        <InputTerminal 
          onSubmit={handleVerify}
          isLoading={isLoading}
          progress={progress}
        />

        {/* Results Section */}
        {results && stats && (
          <div className="space-y-6 animate-fade-in">
            {/* Trust Score */}
            <TrustScore 
              score={results.overall_trust_score}
              totalClaims={stats.totalClaims}
              verifiedClaims={stats.verifiedClaims}
              hallucinationsDetected={stats.hallucinationsDetected}
            />

            {/* Claims Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <span className="text-muted-foreground">&gt;</span>
                DETAILED ANALYSIS
                <span className="text-muted-foreground text-sm">({results.claims.length} claims)</span>
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.claims.map((claim, index) => (
                  <ClaimCard key={index} claim={claim} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!results && !isLoading && (
          <div className="text-center py-16 border-2 border-dashed border-border bg-card/30 rounded-lg">
            <div className="text-6xl mb-4 opacity-30 grayscale">⚡</div>
            <h3 className="text-lg font-bold text-muted-foreground mb-2">
              SYSTEM READY
            </h3>
            <p className="text-sm text-muted-foreground/70">
              Awaiting neural input for verification...
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground/50 py-4 border-t border-border/30">
          <p>AI VERITAS v2.0 • Local Hybrid Neural Network</p>
          <p className="mt-1">Powered by Ollama + Tavily</p>
        </footer>
      </div>

      {/* Toast notifications */}
      {error && (
        <Toast
          type={error.type}
          title={error.title}
          message={error.message}
          details={error.details}
          onDismiss={() => setError(null)}
          onRetry={() => setError(null)}
        />
      )}
    </div>
  );
};
