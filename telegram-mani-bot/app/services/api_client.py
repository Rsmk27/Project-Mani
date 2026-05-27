import httpx
import time
from typing import Dict, Any, Optional
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.config.settings import settings
from app.utils.logger import logger

class APIClientError(Exception):
    """Custom exception for API client errors."""
    pass

class BackendAPIClient:
    def __init__(self):
        self.base_url = settings.BACKEND_API_URL
        self.headers = {
            "Content-Type": "application/json",
        }
        if settings.BACKEND_API_KEY:
            self.headers["Authorization"] = f"Bearer {settings.BACKEND_API_KEY}"

        self.timeout = httpx.Timeout(30.0, connect=10.0)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.TimeoutException)),
        reraise=True
    )
    async def send_message(self, user_id: str, username: Optional[str], message: str) -> Dict[str, Any]:
        """
        Send user message to external Mani backend API.
        Includes retry logic for network errors and timeouts.
        """
        payload = {
            "query": message,
            "siteContext": f"Telegram User: {username} ({user_id})",
            # We can optionally pass "history" here if we maintained session history
        }

        logger.info(f"Sending message to backend for user {user_id}")

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    self.base_url,
                    json=payload,
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error from backend: {e.response.status_code} - {e.response.text}")
                raise APIClientError(f"Backend API returned error status: {e.response.status_code}")
            except httpx.RequestError as e:
                logger.error(f"Request error connecting to backend: {str(e)}")
                raise
            except Exception as e:
                logger.error(f"Unexpected error communicating with backend: {str(e)}")
                raise APIClientError(f"Unexpected error: {str(e)}")

# Global instance
api_client = BackendAPIClient()
