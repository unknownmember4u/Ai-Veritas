import json
from ollama import AsyncClient
from app.schemas import Claim

client = AsyncClient(host='http://localhost:11434')

async def verify_claim_logic(claim_text: str, evidence_data: dict) -> Claim:
    if not evidence_data:
        return Claim(
            original_text=claim_text,
            status="inconclusive",
            confidence_score=0,
            reasoning="No external evidence found.",
            evidence_source=None,
            source_url=None
        )

    evidence_content = evidence_data['content']
    source_url = evidence_data['url']

    prompt = f"""
    ROLE: 
    You are a Senior Fact-Checker for an academic journal. Your specialty is detecting "AI Hallucinations" 
    and "Fake Citations"—plausible-sounding but non-existent references.

    TASK:
    Analyze the CLAIM against the provided EVIDENCE. 
    1. FACTUAL VERITY: Is the claim supported by the evidence?
    2. CITATION INTEGRITY: If the evidence mentions a source (authors, year, title, or URL), 
       verify if it appears legitimate or fabricated based on the snippet.
    3. COMMON SENSE CHECK: Flag biological or physical impossibilities (e.g., "blue pineapples") 
       even if the snippet seems to suggest them (they might be fictional or aesthetic).

    CONTEXT:
    CLAIM: "{claim_text}"
    EVIDENCE SNIPPET: "{evidence_content}"

    THINKING PROCESS (Chain of Thought):
    - Does the evidence directly support the claim? (Supported / Partially / Unsupported)
    - Is the citation in the evidence specific (DOI, Volume, Author) or vague?
    - Is the claim a well-known scientific fact or a likely hallucination?

    OUTPUT FORMAT (Strict JSON):
    {{
        "status": "verified" | "contradicted" | "inconclusive",
        "confidence_score": <int 0-100>,
        "reasoning": "<1-2 sentence breakdown of your verification logic>",
        "citation_status": "valid" | "fake_suspicion" | "no_citation"
    }}
    """

    try:
        response = await client.chat(
            model='llama3',
            messages=[{'role': 'user', 'content': prompt}],
            format='json'
        )
        
        result = json.loads(response['message']['content'])
        
        return Claim(
            original_text=claim_text,
            status=result.get("status", "inconclusive"),
            confidence_score=result.get("confidence_score", 0),
            reasoning=result.get("reasoning", ""),
            evidence_source=evidence_content[:200] + "...", 
            source_url=source_url
        )
    except Exception as e:
        print(f"Ollama Verification Error: {e}")
        return Claim(original_text=claim_text, status="error", confidence_score=0, reasoning=str(e))