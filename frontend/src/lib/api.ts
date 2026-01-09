// API Configuration
const CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 2
};

export interface VerifyRequest {
  text: string;
}

export interface Claim {
  original_text: string;
  status: 'verified' | 'contradicted' | 'inconclusive';
  confidence_score: number;
  reasoning: string;
  source_url: string;
}

export interface VerifyResponse {
  overall_trust_score: number;
  claims: Claim[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  latency?: number;
}

// Mock AI verification functions
async function extractClaims(text: string): Promise<string[]> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
  
  return sentences.slice(0, 10);
}

async function searchEvidence(claim: string): Promise<{url: string, snippet: string}[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock evidence sources based on claim content
  const sources = [
    { domain: 'wikipedia.org', type: 'encyclopedia' },
    { domain: 'nature.com', type: 'scientific' },
    { domain: 'reuters.com', type: 'news' },
    { domain: 'gov.edu', type: 'government' },
  ];
  
  const randomSource = sources[Math.floor(Math.random() * sources.length)];
  
  return [{
    url: `https://${randomSource.domain}/article/${Date.now()}`,
    snippet: `Evidence from ${randomSource.type} source regarding: "${claim.substring(0, 50)}..."`
  }];
}

async function verifyClaim(
  claim: string, 
  evidence: {url: string, snippet: string}[]
): Promise<{
  status: 'verified' | 'contradicted' | 'inconclusive',
  confidence: number,
  reasoning: string
}> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Simulate verification logic
  const hasEvidence = evidence.length > 0;
  const claimLength = claim.length;
  
  // Generate realistic confidence based on claim characteristics
  let baseConfidence = 70 + Math.floor(Math.random() * 25);
  
  // Longer, more detailed claims might be harder to verify
  if (claimLength > 100) baseConfidence -= 10;
  
  // Check for common indicators
  const hasNumbers = /\d+/.test(claim);
  const hasDate = /\d{4}|\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(claim);
  
  if (hasNumbers) baseConfidence += 5;
  if (hasDate) baseConfidence += 5;
  
  baseConfidence = Math.min(98, Math.max(15, baseConfidence));
  
  // Determine status
  const random = Math.random();
  let status: 'verified' | 'contradicted' | 'inconclusive';
  let reasoning: string;
  
  if (random > 0.3) {
    status = 'verified';
    reasoning = `Cross-referenced with ${evidence.length} authoritative source(s). The claim is supported by documented evidence and matches established facts.`;
  } else if (random > 0.15) {
    status = 'inconclusive';
    baseConfidence = 40 + Math.floor(Math.random() * 20);
    reasoning = 'Insufficient corroborating evidence found. The claim requires additional sources for full verification.';
  } else {
    status = 'contradicted';
    baseConfidence = 15 + Math.floor(Math.random() * 25);
    reasoning = 'Found conflicting information from reliable sources. This claim may contain inaccuracies or outdated information.';
  }
  
  return { status, confidence: baseConfidence, reasoning };
}

export async function verifyContent(
  text: string, 
  onProgress?: (stage: string, percent: number, detail?: string) => void
): Promise<VerifyResponse> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text input is required');
  }
  
  onProgress?.('Extracting claims...', 10);
  
  // Step 1: Extract claims
  const claims = await extractClaims(text);
  
  if (claims.length === 0) {
    return { overall_trust_score: 0, claims: [] };
  }
  
  onProgress?.('Searching evidence...', 30, `Found ${claims.length} claims`);
  
  // Step 2 & 3: Verify each claim
  const verifiedClaims: Claim[] = [];
  
  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    const progressPercent = 30 + Math.floor((i / claims.length) * 50);
    onProgress?.('Verifying facts...', progressPercent, `${i + 1}/${claims.length}`);
    
    const evidence = await searchEvidence(claim);
    const verification = await verifyClaim(claim, evidence);
    
    verifiedClaims.push({
      original_text: claim,
      status: verification.status,
      confidence_score: verification.confidence,
      reasoning: verification.reasoning,
      source_url: evidence[0]?.url || 'https://example.com'
    });
  }
  
  onProgress?.('Calculating trust score...', 90);
  
  // Step 4: Calculate overall trust score
  const totalConfidence = verifiedClaims.reduce(
    (sum, claim) => sum + claim.confidence_score, 
    0
  );
  const overall_trust_score = Math.round(totalConfidence / verifiedClaims.length);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  onProgress?.('Complete', 100);
  
  return { overall_trust_score, claims: verifiedClaims };
}

export async function checkHealth(): Promise<HealthResponse> {
  const start = Date.now();
  
  // Simulate a health check
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
  
  return {
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '2.0.1',
    latency: Date.now() - start
  };
}
