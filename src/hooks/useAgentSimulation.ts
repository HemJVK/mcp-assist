import { useState, useEffect } from "react";
import { AgentNode, Connection, LogEntry, ProtocolType } from "@/types";
import { initialAgents, initialConnections, demoLogEntries } from "@/data/mockData";

export const useAgentSimulation = () => {
  const [mode, setMode] = useState<"simulation" | "real">("simulation");
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

  // Fetch backend status
  useEffect(() => {
    if (mode === "real") {
      fetch("http://localhost:3000/api/status")
        .then(res => res.json())
        .then(data => {
          console.log("Backend connected:", data);
        })
        .catch(err => {
          console.error("Backend connection failed:", err);
        });
    }
  }, [mode]);

  // Execute command on backend
  const executeBackendCommand = async (command: string) => {
    try {
      const res = await fetch("http://localhost:3000/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, agentId: "coordinator" }),
      });
      const data = await res.json();

      // Handle visual side effects from backend
      if (data.result?.details?.effects) {
        const effects = data.result.details.effects;

        // Update connections
        if (effects.activateConnection) {
            setConnections(prev => prev.map(c =>
                c.id === effects.activateConnection ? { ...c, active: true } : { ...c, active: false }
            ));
        }

        // Update agents
        if (effects.activateAgent) {
            setAgents(prev => prev.map(a =>
                a.id === effects.activateAgent ? { ...a, status: "active" } :
                (a.id === "coordinator" ? { ...a, status: "active" } : { ...a, status: "idle" })
            ));
        }
      }

      const newEntry: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        protocol: (data.protocol as ProtocolType) || "MCP",
        message: data.message,
        status: "complete", // Mark as complete since we got a response
        details: JSON.stringify(data.result, null, 2),
      };
      setLogEntries(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error("Command execution failed", error);
      const errorEntry: LogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          protocol: "MCP",
          message: "Failed to reach backend",
          status: "alert",
          details: String(error)
      };
      setLogEntries(prev => [errorEntry, ...prev]);
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    if (mode === "real") {
      // In real mode, we might poll or wait for user actions.
      // For now, let's just trigger a test command once to show integration
      executeBackendCommand("Start Sequence");
      setIsRunning(false); // Stop "running" loop as it's event driven
      return;
    }

    if (currentStep >= demoLogEntries.length) return;

    const timer = setTimeout(() => {
      const entry = demoLogEntries[currentStep];
      const newEntry: LogEntry = {
        ...entry,
        id: `log-${Date.now()}`,
        timestamp: new Date(),
      } as LogEntry;

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
  }, [isRunning, currentStep, mode]);

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

  return {
    mode,
    setMode,
    isRunning,
    setIsRunning,
    logEntries,
    setLogEntries,
    agents,
    setAgents,
    connections,
    setConnections,
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
  };
};
