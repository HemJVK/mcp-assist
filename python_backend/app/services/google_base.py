from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.config import get_settings
from typing import Any, Optional

class GoogleBaseService:
    def __init__(self, service_name: str, version: str):
        self.settings = get_settings()
        self.service = None
        self.service_name = service_name
        self.version = version
        self._authenticate()

    def _authenticate(self):
        """
        Authenticates with Google using the refresh token flow.
        """
        if not self.settings.google_client_id or not self.settings.google_refresh_token:
            print(f"Warning: Google Credentials not set. {self.service_name} Service will fail if used.")
            return

        try:
            creds = Credentials(
                None,  # No access token initially
                refresh_token=self.settings.google_refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=self.settings.google_client_id,
                client_secret=self.settings.google_client_secret,
            )
            self.service = build(self.service_name, self.version, credentials=creds)
        except Exception as e:
            print(f"Failed to authenticate with Google {self.service_name}: {e}")

    def get_service(self) -> Optional[Any]:
        return self.service
