import { motion, AnimatePresence } from "framer-motion";
import { Bot, Cpu, Database, Globe, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { AgentNode, Connection } from "@/types";

const agentIcons = {
  coordinator: Cpu,
  specialist: Bot,
  data: Database,
  external: Globe,
};

const agentColors = {
  coordinator: { bg: "bg-cyan-500/20", border: "border-cyan-500/50", glow: "shadow-[0_0_30px_hsl(187_85%_50%/0.4)]" },
  specialist: { bg: "bg-purple-500/20", border: "border-purple-500/50", glow: "shadow-[0_0_30px_hsl(270_70%_60%/0.4)]" },
  data: { bg: "bg-green-500/20", border: "border-green-500/50", glow: "shadow-[0_0_30px_hsl(142_70%_45%/0.4)]" },
  external: { bg: "bg-amber-500/20", border: "border-amber-500/50", glow: "shadow-[0_0_30px_hsl(45_95%_55%/0.4)]" },
};

interface AgentCanvasProps {
  agents: AgentNode[];
  connections: Connection[];
  onAgentClick?: (agent: AgentNode) => void;
}

export const AgentCanvas = ({ agents, connections, onAgentClick }: AgentCanvasProps) => {
  const [pulsingConnections, setPulsingConnections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const activeConns = connections.filter(c => c.active).map(c => c.id);
    setPulsingConnections(new Set(activeConns));
  }, [connections]);

  const getAgentPosition = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? { x: agent.x, y: agent.y } : { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-card/20 via-background to-card/10 overflow-hidden">
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm"
          animate={pulsingConnections.size > 0 ? { borderColor: "hsl(142 70% 45% / 0.5)", backgroundColor: "hsl(142 70% 45% / 0.1)" } : {}}
        >
          <div className="relative flex h-2 w-2">
            {pulsingConnections.size > 0 && (
              <motion.span
                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            <div className={`relative inline-flex rounded-full h-2 w-2 ${pulsingConnections.size > 0 ? "bg-green-500" : "bg-muted-foreground"}`} />
          </div>
          <span className={`text-[10px] font-medium uppercase tracking-wider ${pulsingConnections.size > 0 ? "text-green-500" : "text-muted-foreground"}`}>
            {pulsingConnections.size > 0 ? "Network Active" : "Network Idle"}
          </span>
        </motion.div>
      </div>

      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ left: '10%', top: '20%' }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-secondary/5 blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ right: '20%', bottom: '30%' }}
      />

      {/* SVG for connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(187 85% 50%)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(187 85% 50%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(187 85% 50%)" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {connections.map((conn) => {
          const from = getAgentPosition(conn.from);
          const to = getAgentPosition(conn.to);
          const isActive = pulsingConnections.has(conn.id);

          return (
            <g key={conn.id}>
              {/* Base line */}
              <line
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.3"
              />
              
              {/* Active pulse line */}
              {isActive && (
                <motion.line
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke="url(#connectionGradient)"
                  strokeWidth="2"
                  filter="url(#glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {/* Animated pulse dot */}
              {isActive && (
                <motion.circle
                  r="4"
                  fill="hsl(187 85% 50%)"
                  filter="url(#glow)"
                  initial={{ 
                    cx: `${from.x}%`, 
                    cy: `${from.y}%`,
                    opacity: 0 
                  }}
                  animate={{ 
                    cx: [`${from.x}%`, `${to.x}%`],
                    cy: [`${from.y}%`, `${to.y}%`],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Agent Nodes */}
      <AnimatePresence>
        {agents.map((agent) => {
          const Icon = agentIcons[agent.type];
          const colors = agentColors[agent.type];
          const isActive = agent.status === "active" || agent.status === "processing";

          return (
            <motion.div
              key={agent.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => onAgentClick?.(agent)}
            >
              {/* Outer glow ring for active */}
              {isActive && (
                <motion.div
                  className={`absolute inset-0 rounded-full ${colors.bg} blur-xl`}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 80, height: 80, left: -20, top: -20 }}
                />
              )}

              {/* Node container */}
              <motion.div
                className={`relative w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border-2 flex items-center justify-center backdrop-blur-sm ${isActive ? colors.glow : ""}`}
                animate={agent.status === "processing" ? { rotate: 360 } : {}}
                transition={{ duration: 3, repeat: agent.status === "processing" ? Infinity : 0, ease: "linear" }}
              >
                <Icon className={`w-5 h-5 ${
                  agent.type === "coordinator" ? "text-cyan-400" :
                  agent.type === "specialist" ? "text-purple-400" :
                  agent.type === "data" ? "text-green-400" :
                  "text-amber-400"
                }`} />

                {/* Status indicator */}
                <motion.div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                    agent.status === "active" ? "bg-green-500" :
                    agent.status === "processing" ? "bg-amber-500" :
                    "bg-muted-foreground"
                  }`}
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                />
              </motion.div>

              {/* Agent name */}
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className="text-[10px] font-mono text-muted-foreground bg-card/80 px-2 py-0.5 rounded-full border border-border/50">
                  {agent.name}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Canvas Title */}
      <div className="absolute top-4 left-4">
        <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-3 h-3 text-primary" />
          Agent Orchestration Canvas
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          A2A Protocol Visualization
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4">
        {Object.entries(agentColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded ${colors.bg} ${colors.border} border`} />
            <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export type { AgentNode, Connection };
