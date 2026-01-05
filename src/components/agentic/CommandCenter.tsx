import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Zap,
  Shield,
  Wallet,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtocolLog, LogEntry, ProtocolType } from "./ProtocolLog";
import { AgentCanvas, AgentNode, Connection } from "./AgentCanvas";
import { AP2MandateModal, AGPInterceptModal, MCPConfigModal } from "./HITLModals";

// Demo data
const initialAgents: AgentNode[] = [
  { id: "coordinator", name: "Coordinator", type: "coordinator", x: 50, y: 30, status: "active" },
  { id: "research", name: "Research Agent", type: "specialist", x: 25, y: 55, status: "idle" },
  { id: "writer", name: "Writer Agent", type: "specialist", x: 75, y: 55, status: "idle" },
  { id: "database", name: "Vector DB", type: "data", x: 20, y: 80, status: "idle" },
  { id: "api", name: "External API", type: "external", x: 80, y: 80, status: "idle" },
];

const initialConnections: Connection[] = [
  { id: "c1", from: "coordinator", to: "research", active: false, protocol: "A2A" },
  { id: "c2", from: "coordinator", to: "writer", active: false, protocol: "A2A" },
  { id: "c3", from: "research", to: "database", active: false, protocol: "MCP" },
  { id: "c4", from: "writer", to: "api", active: false, protocol: "AGP" },
];

const demoLogEntries: Omit<LogEntry, "id" | "timestamp">[] = [
  { protocol: "ANS", message: "Discovering available agents in network...", status: "complete", details: "3 agents found" },
  { protocol: "ACDP", message: "Agent capability profiles exchanged", status: "complete" },
  { protocol: "TDF", message: "Task contract established with Research Agent", status: "active", details: "Contract ID: tdf-7829" },
  { protocol: "A2A", message: "Delegating research subtask to specialist", status: "pending" },
  { protocol: "MCP", message: "Accessing vector database context", status: "pending" },
  { protocol: "AGP", message: "Security scan on outbound API request", status: "alert", details: "Sensitive data detected" },
  { protocol: "AP2", message: "Payment authorization requested", status: "alert", details: "$45.00 for API credits" },
];

export const CommandCenter = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [agents, setAgents] = useState(initialAgents);
  const [connections, setConnections] = useState(initialConnections);
  const [activeProtocol, setActiveProtocol] = useState<ProtocolType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Modal states
  const [showAP2Modal, setShowAP2Modal] = useState(false);
  const [showAGPModal, setShowAGPModal] = useState(false);
  const [showMCPModal, setShowMCPModal] = useState(false);

  // Simulation effect
  useEffect(() => {
    if (!isRunning || currentStep >= demoLogEntries.length) return;

    const timer = setTimeout(() => {
      const entry = demoLogEntries[currentStep];
      const newEntry: LogEntry = {
        ...entry,
        id: `log-${Date.now()}`,
        timestamp: new Date(),
      };

      setLogEntries(prev => [newEntry, ...prev]);
      setActiveProtocol(entry.protocol);

      // Update agent states based on protocol
      if (entry.protocol === "A2A") {
        setConnections(prev => prev.map(c => 
          c.id === "c1" ? { ...c, active: true } : c
        ));
        setAgents(prev => prev.map(a => 
          a.id === "research" ? { ...a, status: "processing" } : a
        ));
      }

      if (entry.protocol === "MCP") {
        setConnections(prev => prev.map(c => 
          c.id === "c3" ? { ...c, active: true } : c
        ));
        setAgents(prev => prev.map(a => 
          a.id === "database" ? { ...a, status: "active" } : a
        ));
      }

      if (entry.protocol === "AGP" && entry.status === "alert") {
        setShowAGPModal(true);
        setIsRunning(false);
      }

      if (entry.protocol === "AP2" && entry.status === "alert") {
        setShowAP2Modal(true);
        setIsRunning(false);
      }

      setCurrentStep(prev => prev + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isRunning, currentStep]);

  const handleReset = () => {
    setIsRunning(false);
    setLogEntries([]);
    setAgents(initialAgents);
    setConnections(initialConnections);
    setActiveProtocol(null);
    setCurrentStep(0);
  };

  const handleAGPAllow = () => {
    setShowAGPModal(false);
    setLogEntries(prev => [{
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      protocol: "AGP",
      message: "Outbound request approved by user",
      status: "complete",
    }, ...prev]);
    setIsRunning(true);
  };

  const handleAP2Sign = (budget: number) => {
    setShowAP2Modal(false);
    setLogEntries(prev => [{
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      protocol: "AP2",
      message: `Payment mandate signed - Max budget: $${budget.toFixed(2)}`,
      status: "complete",
    }, ...prev]);
    setIsRunning(true);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Control Bar */}
      <div className="h-14 border-b border-border/30 bg-card/30 backdrop-blur-xl flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30"
            animate={isRunning ? { boxShadow: ["0 0 0px hsl(var(--primary))", "0 0 20px hsl(var(--primary) / 0.5)", "0 0 0px hsl(var(--primary))"] } : {}}
            transition={{ duration: 1.5, repeat: isRunning ? Infinity : 0 }}
          >
            <Zap className={`w-4 h-4 ${isRunning ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
            <span className="text-sm font-medium text-foreground">
              {isRunning ? "Executing" : "Ready"}
            </span>
          </motion.div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRunning(!isRunning)}
              className="gap-2"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick action buttons */}
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 border-green-500/30 text-green-400 hover:bg-green-500/10"
            onClick={() => setShowAP2Modal(true)}
          >
            <Wallet className="w-4 h-4" />
            AP2
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={() => setShowAGPModal(true)}
          >
            <Shield className="w-4 h-4" />
            AGP
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            onClick={() => setShowMCPModal(true)}
          >
            <Settings className="w-4 h-4" />
            MCP
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center: Agent Canvas */}
        <div className="flex-1 min-w-0">
          <AgentCanvas 
            agents={agents} 
            connections={connections}
            onAgentClick={(agent) => console.log("Clicked:", agent)}
          />
        </div>

        {/* Right: Protocol Log */}
        <div className="w-[380px] min-w-[320px]">
          <ProtocolLog entries={logEntries} activeProtocol={activeProtocol} />
        </div>
      </div>

      {/* HITL Modals */}
      <AP2MandateModal
        isOpen={showAP2Modal}
        onClose={() => setShowAP2Modal(false)}
        onSign={handleAP2Sign}
        requestedAmount={45}
        recipient="External API Agent"
      />

      <AGPInterceptModal
        isOpen={showAGPModal}
        onClose={() => setShowAGPModal(false)}
        onAllow={handleAGPAllow}
        onModify={(data) => {
          console.log("Modified data:", data);
          setShowAGPModal(false);
          setIsRunning(true);
        }}
        redactedData="Authorization: Bearer sk-████████████████"
        destination="api.openai.com"
      />

      <MCPConfigModal
        isOpen={showMCPModal}
        onClose={() => setShowMCPModal(false)}
        onSave={(config) => {
          console.log("MCP Config:", config);
          setShowMCPModal(false);
        }}
        initialResources={["file://./context/knowledge.json"]}
        initialTools={["web_search", "code_interpreter"]}
      />
    </div>
  );
};
