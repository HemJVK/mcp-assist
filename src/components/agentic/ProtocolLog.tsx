import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Shield, 
  Wallet, 
  Network, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export type ProtocolType = "ANS" | "ACDP" | "TDF" | "AGP" | "AP2" | "A2A" | "MCP";

interface LogEntry {
  id: string;
  timestamp: Date;
  protocol: ProtocolType;
  message: string;
  status: "pending" | "active" | "complete" | "alert";
  details?: string;
}

const protocolConfig: Record<ProtocolType, { 
  label: string; 
  color: string; 
  bgColor: string; 
  icon: React.ElementType;
  glowColor: string;
}> = {
  ANS: { 
    label: "Agent Discovery", 
    color: "text-cyan-400", 
    bgColor: "bg-cyan-500/20", 
    icon: Search,
    glowColor: "shadow-[0_0_20px_hsl(187_85%_50%/0.5)]"
  },
  ACDP: { 
    label: "Agent Discovery", 
    color: "text-cyan-400", 
    bgColor: "bg-cyan-500/20", 
    icon: Network,
    glowColor: "shadow-[0_0_20px_hsl(187_85%_50%/0.5)]"
  },
  TDF: { 
    label: "Task Contract", 
    color: "text-purple-400", 
    bgColor: "bg-purple-500/20", 
    icon: FileText,
    glowColor: "shadow-[0_0_20px_hsl(270_70%_60%/0.5)]"
  },
  AGP: { 
    label: "Security/Firewall", 
    color: "text-red-400", 
    bgColor: "bg-red-500/20", 
    icon: Shield,
    glowColor: "shadow-[0_0_20px_hsl(0_70%_50%/0.5)]"
  },
  AP2: { 
    label: "Payment/Commerce", 
    color: "text-green-400", 
    bgColor: "bg-green-500/20", 
    icon: Wallet,
    glowColor: "shadow-[0_0_20px_hsl(142_70%_45%/0.5)]"
  },
  A2A: { 
    label: "Agent-to-Agent", 
    color: "text-amber-400", 
    bgColor: "bg-amber-500/20", 
    icon: Zap,
    glowColor: "shadow-[0_0_20px_hsl(45_95%_55%/0.5)]"
  },
  MCP: { 
    label: "Model Context", 
    color: "text-blue-400", 
    bgColor: "bg-blue-500/20", 
    icon: Network,
    glowColor: "shadow-[0_0_20px_hsl(217_90%_60%/0.5)]"
  },
};

const statusIcons = {
  pending: Clock,
  active: Zap,
  complete: CheckCircle,
  alert: AlertTriangle,
};

interface ProtocolLogProps {
  entries: LogEntry[];
  activeProtocol?: ProtocolType | null;
}

export const ProtocolLog = ({ entries, activeProtocol }: ProtocolLogProps) => {
  return (
    <div className="h-full flex flex-col bg-card/30 backdrop-blur-xl border-l border-border/30">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Protocol Execution Log
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Real-time agentic stack updates</p>
      </div>

      {/* Log Entries */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {entries.map((entry, index) => {
              const config = protocolConfig[entry.protocol];
              const StatusIcon = statusIcons[entry.status];
              const ProtocolIcon = config.icon;
              const isActive = activeProtocol === entry.protocol || entry.status === "active";

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`relative pl-6 ${isActive ? config.glowColor : ""} rounded-lg transition-shadow duration-300`}
                >
                  {/* Timeline line */}
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-border/50" />
                  
                  {/* Timeline dot */}
                  <motion.div 
                    className={`absolute left-0 top-3 w-4 h-4 rounded-full ${config.bgColor} flex items-center justify-center`}
                    animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
                  >
                    <div className={`w-2 h-2 rounded-full ${isActive ? "bg-current animate-pulse" : "bg-current/50"} ${config.color}`} />
                  </motion.div>

                  <div className={`p-3 rounded-lg border ${isActive ? "border-border/50 bg-card/50" : "border-transparent bg-card/20"} transition-all duration-300`}>
                    {/* Protocol Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${config.bgColor}`}>
                        <ProtocolIcon className={`w-3 h-3 ${config.color}`} />
                        <span className={`text-[10px] font-mono font-bold ${config.color}`}>
                          [{entry.protocol}]
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusIcon className={`w-3 h-3 ${
                          entry.status === "complete" ? "text-green-400" :
                          entry.status === "alert" ? "text-red-400" :
                          entry.status === "active" ? "text-amber-400" :
                          "text-muted-foreground"
                        }`} />
                        <span className="text-[10px] text-muted-foreground">
                          {entry.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-xs text-foreground leading-relaxed">
                      {entry.message}
                    </p>

                    {/* Details */}
                    {entry.details && (
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                        {entry.details}
                      </p>
                    )}

                    {/* Protocol Label */}
                    <div className="mt-2">
                      <span className="text-[10px] text-muted-foreground">
                        {config.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

export type { LogEntry };
