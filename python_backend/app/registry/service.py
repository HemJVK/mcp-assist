from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any

# ANS: Agent Name Service / ACDP: Agent Capability Discovery Protocol

class AgentProfile(BaseModel):
    name: str  # human-readable name, e.g., worker.local
    id: str
    capabilities: List[Dict[str, Any]] = Field(default_factory=list) # JSON schemas of tools
    endpoint: str

class RegistryService:
    def __init__(self):
        self._registry: Dict[str, AgentProfile] = {}

    def register_agent(self, profile: AgentProfile):
        self._registry[profile.name] = profile
        print(f"Registered agent: {profile.name} ({profile.id})")

    def get_agent(self, name: str) -> Optional[AgentProfile]:
        return self._registry.get(name)

    def list_agents(self) -> List[AgentProfile]:
        return list(self._registry.values())
