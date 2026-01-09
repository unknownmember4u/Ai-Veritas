import json
from ollama import AsyncClient
import os

# Connect to local Ollama instance
client = AsyncClient(host='http://localhost:11434')

async def extract_claims(text: str) -> list[str]:
    print(f"\n🧠 Sending text to Ollama: {text[:50]}...") # DEBUG
    
    prompt = f"""
    Analyze the text and extract every atomic factual claim.
    Ignore opinions.
    Return a JSON object with a key 'claims' containing a list of strings.
    Example: {{ "claims": ["The sky is blue", "Water is wet"] }}
    
    TEXT: "{text}"
    """

    try:
        response = await client.chat(
            model='llama3', # ⚠️ MAKE SURE YOU PULLED THIS MODEL
            messages=[{'role': 'user', 'content': prompt}],
            format='json'
        )
        
        raw_content = response['message']['content']
        print(f"📦 RAW OLLAMA RESPONSE: {raw_content}") # DEBUG: See what it actually said
        
        data = json.loads(raw_content)
        claims = data.get("claims", [])
        print(f"✅ Extracted {len(claims)} claims.")
        return claims
        
    except Exception as e:
        print(f"❌ Ollama Extraction Error: {e}")
        return []