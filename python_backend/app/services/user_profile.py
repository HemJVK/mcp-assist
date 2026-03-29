from typing import Dict

class UserProfileService:
    def __init__(self):
        # In a real app, this would fetch from a database or auth provider (e.g., Supabase, Auth0)
        # For this stage of the "Thesis Ultimate Backend", we use a centralized service
        # that can be easily swapped for a DB call later.
        self.profile = {
            "name": "Hem",
            "phone": "+91-9999999999",
            "role": "Student"
        }

    def get_profile(self) -> Dict:
        return self.profile
