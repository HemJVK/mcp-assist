from enum import Enum
from typing import List, Dict, Optional, Any
import uuid
from app.config import get_settings
from app.services.google_contacts import GoogleContactsService
from app.services.user_profile import UserProfileService
from app.services.gmail_service import GmailService
from app.services.llm_service import LLMService

class WorkflowState(str, Enum):
    IDLE = "IDLE"
    RESOLVING_CONTACTS = "RESOLVING_CONTACTS"
    AWAITING_SELECTION = "AWAITING_SELECTION"
    DRAFTING = "DRAFTING"
    AWAITING_REVIEW = "AWAITING_REVIEW"
    EXECUTING = "EXECUTING"

class EmailWorkflow:
    def __init__(self, workflow_id: str):
        self.id = workflow_id
        self.state = WorkflowState.IDLE
        self.context = {}
        self.draft = ""
        self.contacts_service = GoogleContactsService()
        self.gmail_service = GmailService()
        self.llm_service = LLMService()
        self.user_profile = UserProfileService()
        self.settings = get_settings()

    def start_workflow(self, initial_instruction: str):
        self.state = WorkflowState.RESOLVING_CONTACTS
        # Simple extraction of name from instruction.
        # For POC, assuming input is like "Send email to John" or just "John"
        name = initial_instruction.replace("Send email to ", "").strip()
        self.context["target_name"] = name
        self.context["initial_instruction"] = initial_instruction
        return self.resolve_contact(name)

    def resolve_contact(self, name: str):
        results = self.contacts_service.search_contacts(name)

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
        instruction = self.context.get("initial_instruction", "General update")

        # Real LLM generation
        body = self.llm_service.generate_draft(
            recipient_name=recipient_name,
            sender_profile=user_profile,
            context_instruction=instruction
        )

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

        # Real LLM refinement
        self.draft = self.llm_service.refine_draft(self.draft, instruction)
        return {
            "state": self.state,
            "draft": self.draft
        }

    def send_email(self):
        if self.state != WorkflowState.AWAITING_REVIEW:
            return {"error": "Cannot send email in current state"}

        self.state = WorkflowState.EXECUTING

        recipient = self.context.get("recipient", {})
        to_email = recipient.get("email")

        if not to_email:
            self.state = WorkflowState.AWAITING_REVIEW
            return {"error": "Recipient email not found"}

        # Extract subject from draft or use default
        subject = "Update from " + self.user_profile.get_profile()["name"]

        # Real Sending via Gmail API
        result = self.gmail_service.send_email(to_email, subject, self.draft)

        self.state = WorkflowState.IDLE
        return result
