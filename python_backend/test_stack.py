from fastapi.testclient import TestClient
from app.main import app, wallet
from app.protocols.ap2 import Mandate

client = TestClient(app)

def test_full_stack_flow():
    print("--- Starting Full Stack Verification ---")

    # 1. Register a new Agent (ANS)
    print("\n1. Testing ANS (Agent Registration)...")
    agent_data = {
        "name": "analyzer.local",
        "id": "agent-002",
        "capabilities": [{"name": "echo", "type": "function"}],
        "endpoint": "http://localhost:8000/analyzer"
    }
    response = client.post("/register", json=agent_data)
    assert response.status_code == 200
    print("✅ Agent Registered:", response.json())

    # 2. Create a Payment Mandate (AP2)
    print("\n2. Testing AP2 (Commerce/Mandate)...")
    task_id = "task-101"
    budget_limit = 50.0
    mandate = wallet.sign_mandate(task_id, budget_limit)
    print(f"✅ Mandate Signed: {mandate.signature[:10]}...")

    # 3. Submit a Task (TDF)
    print("\n3. Testing TDF (Task Submission)...")
    task_data = {
        "id": task_id,
        "description": "Analyze this data",
        "constraints": {"max_duration_seconds": 30},
        "success_criteria": {"required_output_format": "text"},
        "budget": {"limit": budget_limit},
        "input_data": {"text": "hello"}
    }
    response = client.post("/task", json=task_data)
    assert response.status_code == 200
    print("✅ Task Accepted:", response.json())

    # 4. Execute a Tool via Gateway (AGP + A2A + MCP)
    print("\n4. Testing Execution with AGP (PII Scrubbing) and Security...")

    # We purposefully include PII in the message to test scrubbing
    pii_message = "Contact me at user@example.com for details."

    execute_payload = {
        "agent_name": "analyzer.local", # Calling the registered agent
        "tool_name": "echo", # Calling the MCP tool 'echo' (orchestrator handles it for demo)
        "arguments": {"message": pii_message},
        "mandate": mandate.model_dump()
    }

    # Send request with valid API Key
    headers = {"X-Agent-API-Key": "valid-api-key-123"}

    response = client.post("/execute", json=execute_payload, headers=headers)

    if response.status_code != 200:
        print("❌ Execution Failed:", response.text)
    else:
        result = response.json()
        print("✅ Execution Successful:", result)

        # Verify PII Scrubbing
        output = result["result"]
        if "[REDACTED]" in output and "user@example.com" not in output:
             print("✅ PII Scrubbing Verified: Email redacted.")
        else:
             print("❌ PII Scrubbing Failed:", output)

    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    test_full_stack_flow()
