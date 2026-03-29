from app.services.google_base import GoogleBaseService
from typing import List, Dict, Any

class GoogleContactsService(GoogleBaseService):
    def __init__(self):
        super().__init__('people', 'v1')

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
