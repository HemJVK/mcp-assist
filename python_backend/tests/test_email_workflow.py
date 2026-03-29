import pytest
from unittest.mock import MagicMock, patch
from app.services.smart_parser import analyze_incoming_email
from app.workflows.email_engine import EmailWorkflow, WorkflowState

def test_smart_parser_no_reply():
    body = "Hello, this is an automated message. If you need help, contact us at support@xyz.com. Thanks."
    sender = "noreply@xyz.com"

    result = analyze_incoming_email(body, sender)

    assert result["is_noreply"] is True
    assert result["alternative_email"] == "support@xyz.com"
    assert "support@xyz.com" in result["warning"]

def test_smart_parser_normal_email():
    body = "Hey, let's meet up."
    sender = "john@xyz.com"

    result = analyze_incoming_email(body, sender)

    assert result["is_noreply"] is False
    assert result["alternative_email"] is None

@patch("app.workflows.email_engine.GoogleContactsService")
def test_workflow_ambiguity(MockGoogleService):
    # Mock the service instance and search method
    mock_service_instance = MockGoogleService.return_value
    mock_service_instance.search_contacts.return_value = [
        {"id": "1", "name": "John Doe", "email": "john.doe@example.com"},
        {"id": "2", "name": "John Smith", "email": "john.smith@example.com"}
    ]

    workflow = EmailWorkflow("test-id")
    # "John" matches multiple mock contacts
    result = workflow.start_workflow("Send email to John")

    assert workflow.state == WorkflowState.AWAITING_SELECTION
    assert result["type"] == "INTERRUPT"
    assert len(result["data"]) == 2

@patch("app.workflows.email_engine.LLMService")
@patch("app.workflows.email_engine.GoogleContactsService")
def test_workflow_resume_and_draft(MockGoogleService, MockLLMService):
    # Mock Google Contacts
    mock_service_instance = MockGoogleService.return_value
    mock_service_instance.search_contacts.return_value = [
         {"id": "1", "name": "John Doe", "email": "john.doe@example.com"},
         {"id": "2", "name": "John Smith", "email": "john.smith@example.com"}
    ]

    # Mock LLM
    mock_llm_instance = MockLLMService.return_value
    mock_llm_instance.generate_draft.return_value = "Dear John Doe,\n\nTest Draft.\n\nBest,\nHem"

    workflow = EmailWorkflow("test-id")
    start_result = workflow.start_workflow("Send email to John")

    assert start_result["type"] == "INTERRUPT"
    assert workflow.state == WorkflowState.AWAITING_SELECTION

    # Simulate selection
    selection = {"id": "1", "name": "John Doe", "email": "john.doe@example.com"}
    result = workflow.resume(selection)

    assert workflow.state == WorkflowState.AWAITING_REVIEW
    assert "Test Draft" in result["draft"]
    # LLM mock returns the draft, so we assert on that

@patch("app.workflows.email_engine.LLMService")
def test_workflow_refine(MockLLMService):
    workflow = EmailWorkflow("test-id")
    workflow.context["recipient"] = {"name": "Test User"}

    # Setup Mock
    mock_llm_instance = MockLLMService.return_value
    mock_llm_instance.generate_draft.return_value = "Original Draft"
    mock_llm_instance.refine_draft.return_value = "Refined Draft"

    workflow.draft_email() # Move to AWAITING_REVIEW

    result = workflow.refine_draft("Make it more professional")

    assert result["state"] == WorkflowState.AWAITING_REVIEW
    assert result["draft"] == "Refined Draft"

@patch("app.workflows.email_engine.GmailService")
@patch("app.workflows.email_engine.LLMService")
def test_workflow_send(MockLLMService, MockGmailService):
    workflow = EmailWorkflow("test-id")
    workflow.context["recipient"] = {"name": "Test User", "email": "test@example.com"}

    # Setup Mocks
    mock_llm_instance = MockLLMService.return_value
    mock_llm_instance.generate_draft.return_value = "Draft Body"

    mock_gmail_instance = MockGmailService.return_value
    mock_gmail_instance.send_email.return_value = {"status": "SENT", "message_id": "123"}

    workflow.draft_email()

    result = workflow.send_email()

    assert workflow.state == WorkflowState.IDLE
    assert result["status"] == "SENT"
