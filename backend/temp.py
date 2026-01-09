import asyncio
import os
from dotenv import load_dotenv

# Import your actual modules
# If these fail, it means your folder structure is wrong or dependencies are missing
try:
    from app.services.extractor import extract_claims
    from app.services.search import search_evidence
    from app.services.verifier import verify_claim_logic
    print("✅ Imports successful!")
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Make sure you are running this from the 'backend' folder.")
    exit()

# Load API Keys
load_dotenv()

async def run_diagnostics():
    print("\n--- 🔍 STARTING DIAGNOSTICS ---")
    
    # 1. TEST KEYS
    google_key = os.getenv("GOOGLE_API_KEY")
    tavily_key = os.getenv("TAVILY_API_KEY")
    
    if not google_key:
        print("❌ CRITICAL: GOOGLE_API_KEY is missing in .env")
        return
    if not tavily_key:
        print("❌ CRITICAL: TAVILY_API_KEY is missing in .env")
        return
    
    print("✅ API Keys detected.")

    # 2. TEST GEMINI (Extractor)
    print("\n--- 🧪 TESTING GEMINI (Extraction) ---")
    test_text = "Python was created by Guido van Rossum in 1991."
    print(f"Input: '{test_text}'")
    try:
        claims = await extract_claims(test_text)
        if claims and isinstance(claims, list):
            print(f"✅ Gemini Response: {claims}")
        else:
            print(f"⚠️ Gemini returned unexpected format: {claims}")
    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        return

    # 3. TEST TAVILY (Search)
    print("\n--- 🧪 TESTING TAVILY (Search) ---")
    test_query = claims[0] if claims else "Python programming history"
    print(f"Searching for: '{test_query}'")
    
    try:
        evidence = await search_evidence(test_query)
        if evidence and 'url' in evidence:
            print(f"✅ Tavily Found: {evidence['url']}")
            print(f"   Snippet: {evidence['content'][:100]}...")
        else:
            print("⚠️ Tavily returned no results (Check your API limit or Query).")
    except Exception as e:
        print(f"❌ Tavily Error: {e}")
        return

    # 4. TEST VERIFICATION LOGIC (Gemini + Evidence)
    print("\n--- 🧪 TESTING VERIFICATION (Logic) ---")
    try:
        if evidence:
            result = await verify_claim_logic(test_query, evidence)
            print(f"✅ Final Verdict: {result.status.upper()}")
            print(f"   Confidence: {result.confidence_score}%")
            print(f"   Reasoning: {result.reasoning}")
        else:
            print("⏭️ Skipping verification test (no evidence found).")
    except Exception as e:
        print(f"❌ Verification Logic Error: {e}")

    print("\n--- 🎉 DIAGNOSTICS COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(run_diagnostics())