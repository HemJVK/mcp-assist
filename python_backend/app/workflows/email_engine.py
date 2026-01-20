from enum import Enum
from typing import List, Dict, Optional, Any
import uuid
from app.config import get_settings

class WorkflowState(str, Enum):
    IDLE = "IDLE"
    RESOLVING_CONTACTS = "RESOLVING_CONTACTS"
    AWAITING_SELECTION = "AWAITING_SELECTION"
    DRAFTING = "DRAFTING"
    AWAITING_REVIEW = "AWAITING_REVIEW"
    EXECUTING = "EXECUTING"

class MockUserProfile:
    def __init__(self):
        self.profile = {
            "name": "Hem",
            "phone": "+91-9999999999",
            "role": "Student"
        }

    def get_profile(self) -> Dict:
        return self.profile

class MockContactsDatabase:
    def __init__(self):
        self.contacts = [
            {"id": "1", "name": "John Doe", "email": "john.doe@example.com", "role": "Professor"},
            {"id": "2", "name": "John Smith", "email": "john.smith@example.com", "role": "Admin"},
            {"id": "3", "name": "Alice Johnson", "email": "alice@example.com", "role": "TA"},
        ]
        self.settings = get_settings()

    def search(self, name: str) -> List[Dict]:
        # Placeholder: If Google API were integrated, we would use self.settings.google_client_secret here
        # to authenticate and search real contacts.
        # if self.settings.google_client_id:
        #     pass # Real implementation would go here

        return [c for c in self.contacts if name.lower() in c["name"].lower()]

class EmailWorkflow:
    def __init__(self, workflow_id: str):
        self.id = workflow_id
        self.state = WorkflowState.IDLE
        self.context = {}
        self.draft = ""
        self.contacts_db = MockContactsDatabase()
        self.user_profile = MockUserProfile()
        self.settings = get_settings()

    def start_workflow(self, initial_instruction: str):
        self.state = WorkflowState.RESOLVING_CONTACTS
        # Simple extraction of name from instruction.
        # For POC, assuming input is like "Send email to John" or just "John"
        name = initial_instruction.replace("Send email to ", "").strip()
        self.context["target_name"] = name
        return self.resolve_contact(name)

    def resolve_contact(self, name: str):
        results = self.contacts_db.search(name)
        if len(results) > 1:
            self.state = WorkflowState.AWAITING_SELECTION
            return {
                "type": "INTERRUPT",
                "step": "SELECT_CONTACT",
                "data": results,
                "message": f"Found multiple contacts for {name}. Please select one."
            }
        elif len(results) == 1:
            self.context["recipient"] = results[0]
            self.state = WorkflowState.DRAFTING
            return self.draft_email()
        else:
            # Handle no contact found.
            return {"error": f"No contact found for {name}"}

    def resume(self, selection_data: Dict):
        if self.state != WorkflowState.AWAITING_SELECTION:
            return {"error": "Workflow is not awaiting selection"}

        # selection_data expected to be one of the contact objects
        self.context["recipient"] = selection_data
        self.state = WorkflowState.DRAFTING
        return self.draft_email()

    def draft_email(self):
        recipient = self.context.get("recipient", {})
        recipient_name = recipient.get("name", "there")
        user_profile = self.user_profile.get_profile()

        # Mock LLM generation
        body = f"Dear {recipient_name},\n\nI hope this email finds you well.\n\n[Content Placeholder based on intent]\n\nBest regards,\n{user_profile['name']}\n{user_profile['role']}\n{user_profile['phone']}"

        self.draft = body
        self.state = WorkflowState.AWAITING_REVIEW
        return {
            "state": self.state,
            "draft": self.draft,
            "recipient": recipient
        }

    def refine_draft(self, instruction: str):
        if self.state != WorkflowState.AWAITING_REVIEW:
             return {"error": "Cannot refine draft in current state"}

        # Mock LLM refinement
        self.draft = f"[Refined based on: '{instruction}']\n" + self.draft
        return {
            "state": self.state,
            "draft": self.draft
        }

    def send_email(self):
        if self.state != WorkflowState.AWAITING_REVIEW:
            return {"error": "Cannot send email in current state"}

        self.state = WorkflowState.EXECUTING
        # Mock sending
        self.state = WorkflowState.IDLE
        return {
            "status": "SENT",
            "message": "Email sent successfully"
        }
