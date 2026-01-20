from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.config import get_settings
from typing import List, Dict, Any

class GoogleContactsService:
    def __init__(self):
        self.settings = get_settings()
        self.service = None
        self._authenticate()

    def _authenticate(self):
        """
        Authenticates with Google using the refresh token flow.
        """
        if not self.settings.google_client_id or not self.settings.google_refresh_token:
            print("Warning: Google Credentials not set. Google Contacts Service will fail if used.")
            return

        try:
            creds = Credentials(
                None,  # No access token initially
                refresh_token=self.settings.google_refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=self.settings.google_client_id,
                client_secret=self.settings.google_client_secret,
            )
            self.service = build('people', 'v1', credentials=creds)
        except Exception as e:
            print(f"Failed to authenticate with Google: {e}")

    def search_contacts(self, query: str) -> List[Dict[str, Any]]:
        """
        Searches for contacts matching the query string in names or emails.
        """
        if not self.service:
            return []

        results = []
        try:
            # Search execution
            response = self.service.people().searchContacts(
                query=query,
                readMask="names,emailAddresses"
            ).execute()

            if "results" in response:
                for person_result in response["results"]:
                    person = person_result.get("person", {})

                    # Extract Name
                    names = person.get("names", [])
                    display_name = names[0].get("displayName") if names else "Unknown"

                    # Extract Emails
                    emails = person.get("emailAddresses", [])

                    if emails:
                        for email in emails:
                            results.append({
                                "id": person.get("resourceName", "unknown"),
                                "name": display_name,
                                "email": email.get("value"),
                                "role": "Contact" # Default role as API doesn't provide this easily
                            })
        except Exception as e:
            print(f"Error searching contacts: {e}")
            return []

        return results
