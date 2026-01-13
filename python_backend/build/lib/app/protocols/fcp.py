from typing import Dict, Any, List
from pydantic import BaseModel, ValidationError
import json

# FCP: Function Call Protocol

class ToolCall(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]

class FunctionCallProtocol:
    """
    Validates LLM tool outputs against expected JSON schemas.
    """

    @staticmethod
    def validate_call(tool_call: ToolCall, schema: Dict[str, Any]) -> bool:
        # In a real implementation, this would use a library like `jsonschema`
        # or pydantic's dynamic model creation to validate the arguments against the schema.
        # For this boilerplate, we'll do a basic check.

        # Mock validation: Check if required keys in schema properties exist in arguments
        if "properties" in schema:
            for prop, details in schema["properties"].items():
                if prop not in tool_call.arguments and prop in schema.get("required", []):
                    return False
        return True

    @staticmethod
    def parse_llm_output(llm_response: str) -> List[ToolCall]:
        # Mock parser that assumes the LLM returns a JSON string of tool calls
        try:
            data = json.loads(llm_response)
            if isinstance(data, list):
                return [ToolCall(**item) for item in data]
            elif isinstance(data, dict):
                return [ToolCall(**data)]
            return []
        except (json.JSONDecodeError, ValidationError):
            return []
