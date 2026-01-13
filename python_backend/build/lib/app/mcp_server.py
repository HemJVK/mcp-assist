from typing import List, Dict, Any
from pydantic import BaseModel

# Data Layer (MCP) Implementation
# Simple in-memory mock of an MCP server.

class Tool(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]

class MCPServer:
    def __init__(self, name: str):
        self.name = name
        self.resources = {
            "file://local/config": {"content": "system_mode=active"},
            "db://users/count": {"content": "42"}
        }
        self.tools = [
            Tool(
                name="read_resource",
                description="Reads a local resource by URI",
                input_schema={"type": "object", "properties": {"uri": {"type": "string"}}}
            ),
             Tool(
                name="echo",
                description="Echoes back the input",
                input_schema={"type": "object", "properties": {"message": {"type": "string"}}}
            )
        ]

    def list_tools(self) -> List[Tool]:
        return self.tools

    def read_resource(self, uri: str) -> Dict[str, Any]:
        if uri in self.resources:
            return self.resources[uri]
        raise ValueError(f"Resource not found: {uri}")

    def call_tool(self, name: str, arguments: Dict[str, Any]) -> Any:
        if name == "read_resource":
            return self.read_resource(arguments.get("uri"))
        elif name == "echo":
            return arguments.get("message")
        else:
            raise ValueError(f"Tool not found: {name}")
