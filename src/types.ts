export type ProtocolType = "ANS" | "ACDP" | "TDF" | "AGP" | "AP2" | "A2A" | "MCP";

export interface LogEntry {
  id: string;
  timestamp: Date;
  protocol: ProtocolType;
  message: string;
  status: "pending" | "active" | "complete" | "alert";
  details?: string;
}

export interface AgentNode {
  id: string;
  name: string;
  type: "coordinator" | "specialist" | "data" | "external";
  x: number;
  y: number;
  status: "idle" | "active" | "processing";
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  active: boolean;
  protocol: string;
}
