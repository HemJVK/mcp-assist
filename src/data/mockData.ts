import { AgentNode, Connection, LogEntry } from "@/types";

export const initialAgents: AgentNode[] = [
  { id: "coordinator", name: "Coordinator", type: "coordinator", x: 50, y: 30, status: "active" },
  { id: "research", name: "Research Agent", type: "specialist", x: 25, y: 55, status: "idle" },
  { id: "writer", name: "Writer Agent", type: "specialist", x: 75, y: 55, status: "idle" },
  { id: "database", name: "Vector DB", type: "data", x: 20, y: 80, status: "idle" },
  { id: "api", name: "External API", type: "external", x: 80, y: 80, status: "idle" },
];

export const initialConnections: Connection[] = [
  { id: "c1", from: "coordinator", to: "research", active: false, protocol: "A2A" },
  { id: "c2", from: "coordinator", to: "writer", active: false, protocol: "A2A" },
  { id: "c3", from: "research", to: "database", active: false, protocol: "MCP" },
  { id: "c4", from: "writer", to: "api", active: false, protocol: "AGP" },
];

export const demoLogEntries: Omit<LogEntry, "id" | "timestamp">[] = [
  { protocol: "ANS", message: "Discovering available agents in network...", status: "complete", details: "3 agents found" },
  { protocol: "ACDP", message: "Agent capability profiles exchanged", status: "complete" },
  { protocol: "TDF", message: "Task contract established with Research Agent", status: "active", details: "Contract ID: tdf-7829" },
  { protocol: "A2A", message: "Delegating research subtask to specialist", status: "pending" },
  { protocol: "MCP", message: "Accessing vector database context", status: "pending" },
  { protocol: "AGP", message: "Security scan on outbound API request", status: "alert", details: "Sensitive data detected" },
  { protocol: "AP2", message: "Payment authorization requested", status: "alert", details: "$45.00 for API credits" },
];
