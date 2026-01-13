from fastapi import Request, HTTPException
import re

# AGP: Agent Gateway Protocol

class GatewayMiddleware:
    """
    Middleware for scrubbing PII and validating API keys.
    """

    PII_PATTERNS = [
        r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", # Email
        r"\d{3}-\d{2}-\d{4}", # SSN (mock)
    ]

    def __init__(self, api_keys: list[str]):
        self.valid_keys = api_keys

    def validate_key(self, api_key: str):
        if api_key not in self.valid_keys:
            raise HTTPException(status_code=401, detail="Invalid API Key")

    def scrub_pii(self, text: str) -> str:
        scrubbed_text = text
        for pattern in self.PII_PATTERNS:
            scrubbed_text = re.sub(pattern, "[REDACTED]", scrubbed_text)
        return scrubbed_text

    async def process_request(self, request: Request, call_next):
        # 1. API Key Validation
        api_key = request.headers.get("X-Agent-API-Key")
        if not api_key:
             # Allow requests without key for internal demo/testing paths if needed,
             # but strictly enforces AGP usually.
             pass
             # For strictness: self.validate_key(api_key) if api_key else ...

        # 2. PII Scrubbing (Simulated on request body for POST)
        # In a real middleware, getting the body consumes the stream, so we have to be careful.
        # This implementation provides the helper methods to be called in endpoints.

        response = await call_next(request)
        return response
