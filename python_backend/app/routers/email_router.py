from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uuid

from app.workflows.email_engine import EmailWorkflow

router = APIRouter(prefix="/api/workflow", tags=["workflow"])

# In-memory store for workflows
workflow_store: Dict[str, EmailWorkflow] = {}

class StartWorkflowRequest(BaseModel):
    instruction: str

class ResumeWorkflowRequest(BaseModel):
    selection: Dict[str, Any]

class RefineDraftRequest(BaseModel):
    instruction: str

@router.post("/start")
def start_workflow(request: StartWorkflowRequest):
    workflow_id = str(uuid.uuid4())
    workflow = EmailWorkflow(workflow_id)
    workflow_store[workflow_id] = workflow

    result = workflow.start_workflow(request.instruction)
    return {"workflow_id": workflow_id, "result": result}

@router.post("/{workflow_id}/resume")
def resume_workflow(workflow_id: str, request: ResumeWorkflowRequest):
    workflow = workflow_store.get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    result = workflow.resume(request.selection)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"workflow_id": workflow_id, "result": result}

@router.post("/{workflow_id}/refine")
def refine_draft(workflow_id: str, request: RefineDraftRequest):
    workflow = workflow_store.get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    result = workflow.refine_draft(request.instruction)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"workflow_id": workflow_id, "result": result}

@router.post("/{workflow_id}/send")
def send_email(workflow_id: str):
    workflow = workflow_store.get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    result = workflow.send_email()
    if "error" in result:
         raise HTTPException(status_code=400, detail=result["error"])
    return {"workflow_id": workflow_id, "result": result}
