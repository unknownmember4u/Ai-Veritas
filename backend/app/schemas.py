from pydantic import BaseModel, Field
from typing import List, Optional

class VerifyRequest(BaseModel):
    text: str

class Claim(BaseModel):
    original_text: str
    status: str = Field(..., description="verified, contradicted, or inconclusive")
    confidence_score: int
    reasoning: str
    evidence_source: Optional[str] = None
    source_url: Optional[str] = None

class VerificationResponse(BaseModel):
    claims: List[Claim]
    overall_trust_score: int