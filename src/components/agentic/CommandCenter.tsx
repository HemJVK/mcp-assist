import { motion } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Zap,
  Shield,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtocolLog } from "./ProtocolLog";
import { AgentCanvas } from "./AgentCanvas";
import { AP2MandateModal, AGPInterceptModal, MCPMarketplaceModal } from "./HITLModals";
import { useAgentSimulation } from "@/hooks/useAgentSimulation";

export const CommandCenter = () => {
  const {
    mode,
    setMode,
    isRunning,
    setIsRunning,
    logEntries,
    agents,
    connections,
    activeProtocol,
    showAP2Modal,
    setShowAP2Modal,
    showAGPModal,
    setShowAGPModal,
    showMCPModal,
    setShowMCPModal,
    handleReset,
    handleAGPAllow,
    handleAP2Sign,
  } = useAgentSimulation();

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

          <div className="flex items-center gap-2 border-r pr-4 border-border/30">
            <span className="text-xs text-muted-foreground">Mode:</span>
            <div className="flex bg-muted/50 rounded-md p-0.5">
              <button
                onClick={() => setMode("simulation")}
                title="Use mock data for demonstration"
                className={`px-2 py-0.5 text-xs rounded-sm transition-colors ${mode === "simulation" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sim
              </button>
              <button
                onClick={() => setMode("real")}
                title="Connect to local MCP backend (http://localhost:3000)"
                className={`px-2 py-0.5 text-xs rounded-sm transition-colors ${mode === "real" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Real
              </button>
            </div>
          </div>

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
