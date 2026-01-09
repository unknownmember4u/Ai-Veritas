from tavily import TavilyClient
import os
import asyncio

# Initialize Tavily
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

async def search_evidence(query: str):
    """
    Searches the web for the given query and returns the top result snippet and URL.
    This runs asynchronously to not block the server.
    """
    print(f"🔍 Searching for: {query}")
    try:
        # We run this in a thread because Tavily's python client might be synchronous
        response = await asyncio.to_thread(
            tavily_client.search,
            query=query,
            search_depth="basic",
            max_results=1
        )
        
        if response.get('results'):
            top_result = response['results'][0]
            return {
                "content": top_result.get('content', 'No content available'),
                "url": top_result.get('url', 'No URL')
            }
        return None
    except Exception as e:
        print(f"Search Error: {e}")
        return None