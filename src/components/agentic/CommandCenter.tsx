import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Zap,
  Shield,
  Wallet,
  Send,
  Loader2,
  Layers,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtocolLog, LogEntry, ProtocolType } from "./ProtocolLog";
import { AgentCanvas, AgentNode, Connection } from "./AgentCanvas";
import { AP2MandateModal, AGPInterceptModal, MCPMarketplaceModal } from "./HITLModals";
import { WorkflowLog } from "@/components/WorkflowLog";

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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const CommandCenter = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [agents, setAgents] = useState(initialAgents);
  const [connections, setConnections] = useState(initialConnections);
  const [activeProtocol, setActiveProtocol] = useState<ProtocolType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeView, setActiveView] = useState<"chat" | "canvas">("chat");

  // Chat states
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Chat handlers
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    // Start the simulation when user sends a message
    setIsRunning(true);

    // Simulate AI processing
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand your request. I'll help you automate this task using LLMs and MCPs. Check the Task Execution Log on the right to see the workflow progress.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Center Panel - Chat or Canvas */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border/30">
          {/* Panel Header with Tabs */}
          <div className="border-b border-border/30 px-6 py-3 flex items-center justify-between bg-card/30 backdrop-blur-sm">
            <div>
              <h2 className="text-xl font-semibold">
                {activeView === "chat" ? "Chat prompt" : "Agent Orchestration Canvas"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeView === "chat" 
                  ? "Intelligent automation for optimizing processes" 
                  : "A2A Protocol Visualization"}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "chat" | "canvas")}>
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="chat" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="canvas" className="gap-2">
                    <Layers className="w-4 h-4" />
                    Canvas
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Control Buttons (visible in canvas mode) */}
              {activeView === "canvas" && (
                <div className="flex items-center gap-2">
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
              )}

              {/* Quick action buttons */}
              <div className="flex items-center gap-2">
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
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {activeView === "chat" ? (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4 max-w-md">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                          <Send className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">Start a conversation</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Type your request below to automate tasks with AI-powered agents.
                          For example: "Draft a mail to xyz@gmail.com on updating their Jira Status for PROJ-1234"
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <Card
                        key={message.id}
                        className={`p-4 ${
                          message.role === "user"
                            ? "bg-muted/50 ml-auto max-w-[80%]"
                            : "bg-primary/5 border-primary/20 max-w-[80%]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.role === "user"
                                ? "bg-secondary text-secondary-foreground"
                                : "bg-primary text-primary-foreground"
                            }`}
                          >
                            {message.role === "user" ? "U" : "AI"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            <span className="text-xs text-muted-foreground mt-2 block">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                  {isProcessing && (
                    <Card className="p-4 bg-muted/30 max-w-[80%]">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Processing...</span>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-border/30 p-4 bg-card/30">
                  <div className="flex gap-3 items-end">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Draft a mail to xyz@gmail.com on updating their Jira Status for PROJ-1234"
                      className="min-h-[60px] max-h-[120px] resize-none bg-muted/50 border-border/50 focus:border-primary transition-colors"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isProcessing}
                      size="lg"
                      className="px-6 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="canvas"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1"
              >
                <AgentCanvas 
                  agents={agents} 
                  connections={connections}
                  onAgentClick={(agent) => console.log("Clicked:", agent)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Task Execution Log or Protocol Log (only show after query execution) */}
        {(activeView === "canvas" || messages.length > 0) && (
          <div className="w-[380px] min-w-[320px] flex flex-col">
            {activeView === "chat" ? (
              <WorkflowLog />
            ) : (
              <ProtocolLog entries={logEntries} activeProtocol={activeProtocol} />
            )}
          </div>
        )}
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

      <MCPMarketplaceModal
        isOpen={showMCPModal}
        onClose={() => setShowMCPModal(false)}
        onInstall={(itemId) => {
          console.log("Installed MCP item:", itemId);
        }}
      />
    </div>
  );
};
