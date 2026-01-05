from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# TDF: Task Definition Format

class Constraints(BaseModel):
    max_duration_seconds: int = 60
    allowed_tools: List[str] = Field(default_factory=list)
    forbidden_terms: List[str] = Field(default_factory=list)

class SuccessCriteria(BaseModel):
    required_output_format: str = "json"
    validation_schema: Optional[Dict[str, Any]] = None

class Budget(BaseModel):
    currency: str = "USD"
    limit: float = 0.0

class TaskDefinition(BaseModel):
    id: str
    description: str
    constraints: Constraints
    success_criteria: SuccessCriteria
    budget: Budget
    input_data: Dict[str, Any] = Field(default_factory=dict)
