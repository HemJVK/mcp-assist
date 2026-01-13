import express from "express";
import cors from "cors";
import mcpServer from "./mcpServer.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Start the MCP server
const mcpPort = 3001;
mcpServer.listen(mcpPort).then(() => {
  console.log(`MCP Server running on port ${mcpPort}`);
});

app.get("/api/status", (req, res) => {
  res.json({ status: "running", port });
});

app.post("/api/command", async (req, res) => {
  const { command, agentId } = req.body;

  // In a real implementation, we would call the MCP tool here.
  // For this demo, we simulate the tool execution that mirrors what `execute_protocol` does
  // so the frontend receives the rich data structure.

  // Simulate logic based on command content to pick a protocol
  let protocol = "A2A";
  if (command.toLowerCase().includes("database") || command.toLowerCase().includes("context")) protocol = "MCP";
  else if (command.toLowerCase().includes("security") || command.toLowerCase().includes("api")) protocol = "AGP";

  const target = agentId || "coordinator";

  // Simulate tool response
  const effects = {
    activateAgent: protocol === "MCP" ? "database" : (protocol === "AGP" ? "api" : "research"),
    activateConnection: protocol === "MCP" ? "c3" : (protocol === "AGP" ? "c4" : "c1"),
    status: "active"
  };

  res.json({
    message: `Backend processed: ${command}`,
    protocol,
    agentId: target,
    timestamp: new Date(),
    result: {
      status: "success",
      details: {
        execution_id: Math.random().toString(36).substring(7),
        protocol_version: "2.0",
        effects
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
