from fastapi import FastAPI, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Dict, Any, List

from .protocols.tdf import TaskDefinition
from .protocols.fcp import FunctionCallProtocol
from .protocols.ap2 import Wallet, Mandate
from .registry.service import RegistryService, AgentProfile
from .gateway.middleware import GatewayMiddleware
from .mcp_server import MCPServer

app = FastAPI(title="2025 Standardized Agentic Stack Orchestrator")

# Initialize Core Services
registry = RegistryService()
wallet = Wallet(private_key="super-secret-key") # Mock Wallet
gateway = GatewayMiddleware(api_keys=["valid-api-key-123"])
mcp_server = MCPServer(name="orchestrator-mcp")

# Pre-register a dummy worker agent
registry.register_agent(AgentProfile(
    name="worker.local",
    id="agent-001",
    capabilities=[{"name": "process_data", "type": "function"}],
    endpoint="http://localhost:8000/worker"
))

# --- API Models ---
class ExecuteRequest(BaseModel):
    agent_name: str
    tool_name: str
    arguments: Dict[str, Any]
    mandate: Mandate

# --- Endpoints ---

@app.get("/")
async def root():
    return {
        "status": "active",
        "stack": "2025 Standardized Agentic Stack",
        "services": ["ANS", "ACDP", "TDF", "FCP", "AGP", "AP2", "MCP"]
    }

# 1. Identity & Discovery (ANS/ACDP)
@app.post("/register")
async def register_agent(profile: AgentProfile):
    registry.register_agent(profile)
    return {"status": "registered", "id": profile.id}

@app.get("/agents")
async def list_agents():
    return registry.list_agents()

# 2. Task & Execution (TDF)
@app.post("/task")
async def submit_task(task: TaskDefinition):
    # Validate Task budget against a generated mandate if specific logic required
    # For now, just accept valid TDF
    return {"status": "accepted", "task_id": task.id}

# 3. Transport & Security (A2A/AGP) + Commerce (AP2)
@app.post("/execute")
async def execute_tool(req: ExecuteRequest, request: Request):
    # AGP: API Key Validation
    api_key = request.headers.get("X-Agent-API-Key")
    gateway.validate_key(api_key)

    # AGP: PII Scrubbing on arguments (Simulated)
    # We scrub string arguments to ensure no PII leaks to the tool
    scrubbed_args = {}
    for k, v in req.arguments.items():
        if isinstance(v, str):
            scrubbed_args[k] = gateway.scrub_pii(v)
        else:
            scrubbed_args[k] = v

    # AP2: Payment Mandate Verification
    if not wallet.verify_mandate(req.mandate):
        raise HTTPException(status_code=402, detail="Invalid Payment Mandate Signature")

    # Process "Payment" (Mock deduction)
    if not wallet.process_payment(10.0, req.mandate): # Assume tool cost is 10.0
        raise HTTPException(status_code=402, detail="Insufficient funds or budget exceeded")

    # FCP: Validate Call against Schema (Simulating schema lookup from registry)
    agent = registry.get_agent(req.agent_name)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # TIR/MCP: Tool Integrated Reasoning - Execute locally via MCP for this demo
    # In a real distributed system, we'd forward this via JSON-RPC to agent.endpoint
    try:
        result = mcp_server.call_tool(req.tool_name, scrubbed_args)
        return {
            "status": "success",
            "agent": req.agent_name,
            "tool": req.tool_name,
            "result": result,
            "cost": 10.0
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# 4. Data Layer (MCP)
@app.get("/mcp/tools")
async def get_mcp_tools():
    return mcp_server.list_tools()

@app.get("/mcp/resource")
async def get_mcp_resource(uri: str):
    try:
        return mcp_server.read_resource(uri)
    except ValueError:
        raise HTTPException(status_code=404, detail="Resource not found")
