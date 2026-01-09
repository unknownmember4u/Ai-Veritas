import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
# Import the modules from the team
from app.schemas import VerifyRequest, VerificationResponse
from app.services.extractor import extract_claims
from app.services.search import search_evidence
from app.services.verifier import verify_claim_logic


app = FastAPI(title="AI Veritas Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

async def process_single_claim(claim_text: str):
    """
    Pipeline for a single claim:
    Extractor (Done) -> Search (Person 2) -> Verify (Person 3)
    """
    # 1. Search (Person 2)
    evidence = await search_evidence(claim_text)
    
    # 2. Verify (Person 3)
    final_result = await verify_claim_logic(claim_text, evidence)
    
    return final_result

@app.post("/verify", response_model=VerificationResponse)
async def verify_endpoint(request: VerifyRequest):
    # Step 1: Person 1 (Extract claims)
    claims_list = await extract_claims(request.text)
    
    if not claims_list:
        return VerificationResponse(claims=[], overall_trust_score=0)

    # Step 2: Run Pipeline in Parallel for speed
    tasks = [process_single_claim(claim) for claim in claims_list]
    verified_claims = await asyncio.gather(*tasks)

    # Step 3: Calculate Score
    # Simple logic: Average confidence of 'verified' claims
    total_score = 0
    if verified_claims:
        # Give 100 points for verified, 0 for contradicted
        scores = []
        for c in verified_claims:
            if c.status == 'verified':
                scores.append(c.confidence_score)
            elif c.status == 'contradicted':
                scores.append(0) # Penalize heavily
            else:
                scores.append(50) # Neutral for inconclusive
        
        total_score = int(sum(scores) / len(scores))

    return VerificationResponse(
        claims=verified_claims,
        overall_trust_score=total_score
    )

@app.get("/")
def home():
    return {"message": "AI Veritas System is Online 🟢"}