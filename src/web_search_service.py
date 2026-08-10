import requests
from typing import List, Dict, Tuple

try:
    from ddgs import DDGS
except ImportError:
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        DDGS = None

def perform_web_search(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    """Perform web search via DuckDuckGo."""
    if DDGS is None:
        return []
    try:
        ddgs = DDGS()
        results = list(ddgs.text(query, max_results=max_results))
        return results
    except Exception as e:
        print(f"[Web Search Warning]: {e}")
        return []

def search_and_format_context(query: str, max_results: int = 3) -> Tuple[str, List[Dict[str, str]]]:
    """Execute search and return formatted string for LLM grounding context."""
    results = perform_web_search(query, max_results=max_results)
    if not results:
        return "", []

    formatted = f"=== LIVE WEB SEARCH CONTEXT FOR GROUNDING ('{query}') ===\n"
    for idx, item in enumerate(results, 1):
        title = item.get("title", "No Title")
        url = item.get("href", "#")
        snippet = item.get("body", "No Snippet")
        formatted += f"[{idx}] {title}\nURL: {url}\nSnippet: {snippet}\n\n"
    formatted += "=========================================================\n"
    return formatted, results
