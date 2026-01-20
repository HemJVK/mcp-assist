import pytest
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

def test_workflow_ambiguity():
    workflow = EmailWorkflow("test-id")
    # "John" matches multiple mock contacts
    result = workflow.start_workflow("Send email to John")

    assert workflow.state == WorkflowState.AWAITING_SELECTION
    assert result["type"] == "INTERRUPT"
    assert len(result["data"]) > 1

def test_workflow_resume_and_draft():
    workflow = EmailWorkflow("test-id")
    workflow.start_workflow("Send email to John")

    # Simulate selection
    selection = {"id": "1", "name": "John Doe", "email": "john.doe@example.com"}
    result = workflow.resume(selection)

    assert workflow.state == WorkflowState.AWAITING_REVIEW
    assert "Dear John Doe" in result["draft"]
    # Check signature injection
    assert "Hem" in result["draft"]
    assert "Student" in result["draft"]

def test_workflow_refine():
    workflow = EmailWorkflow("test-id")
    workflow.context["recipient"] = {"name": "Test User"}
    workflow.draft_email() # Move to AWAITING_REVIEW

    initial_draft = workflow.draft
    result = workflow.refine_draft("Make it more professional")

    assert result["state"] == WorkflowState.AWAITING_REVIEW
    assert "Refined based on" in result["draft"]
    assert len(result["draft"]) > len(initial_draft)

def test_workflow_send():
    workflow = EmailWorkflow("test-id")
    workflow.context["recipient"] = {"name": "Test User"}
    workflow.draft_email()

    result = workflow.send_email()

    assert workflow.state == WorkflowState.IDLE
    assert result["status"] == "SENT"
