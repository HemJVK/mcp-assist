import { useState, useEffect, useCallback } from "react";
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
  MessageSquare,
  Mic,
  MicOff,
  AlertCircle
} from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtocolLog, LogEntry, ProtocolType } from "./ProtocolLog";
import { AgentCanvas, AgentNode, Connection } from "./AgentCanvas";
import { AP2MandateModal, AGPInterceptModal, MCPMarketplaceModal } from "./HITLModals";
import { ContactSelectorModal } from "./ContactSelectorModal";
import { EmailDraftPreviewModal } from "./EmailDraftPreviewModal";
import { WorkflowLog } from "@/components/WorkflowLog";
import { toast } from "sonner";
import * as EmailAgentService from "@/services/email-agent";
import type { 
  Message, 
  Contact, 
  EmailDraft, 
  ParsedIntent, 
  UserProfile,
  WorkflowStep 
} from "@/types/email-agent";

// Demo data for agent canvas
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

// Default user profile (in production, would come from auth/registration)
const defaultUserProfile: UserProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@company.com",
  designation: "Product Manager",
  phone: "+1 (555) 123-4567",
  company: "TechCorp Inc."
};

export const CommandCenter = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [agents, setAgents] = useState(initialAgents);
  const [connections, setConnections] = useState(initialConnections);
  const [activeProtocol, setActiveProtocol] = useState<ProtocolType | null>(null);
  const [activeView, setActiveView] = useState<"chat" | "canvas">("chat");

  // Chat states
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Workflow states
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [currentIntent, setCurrentIntent] = useState<ParsedIntent | null>(null);
  const [currentDraft, setCurrentDraft] = useState<EmailDraft | null>(null);
  const [resolvedRecipients, setResolvedRecipients] = useState<Contact[]>([]);
  const [pendingRecipients, setPendingRecipients] = useState<string[]>([]);

  // Voice input
  const { 
    isListening, 
    isSupported: isVoiceSupported, 
    interimTranscript,
    toggleListening,
    stopListening,
  } = useVoiceInput({
    onTranscript: (text) => {
      setInput(prev => prev + (prev ? " " : "") + text);
    },
    continuous: true,
  });

  // Modal states
  const [showAP2Modal, setShowAP2Modal] = useState(false);
  const [showAGPModal, setShowAGPModal] = useState(false);
  const [showMCPModal, setShowMCPModal] = useState(false);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showDraftPreview, setShowDraftPreview] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  // Disambiguation state
  const [disambiguationData, setDisambiguationData] = useState<{
    ambiguousName: string;
    candidates: Contact[];
  } | null>(null);

  // Add workflow step helper
  const addWorkflowStep = useCallback((step: Omit<WorkflowStep, "id" | "timestamp">) => {
    const newStep: WorkflowStep = {
      ...step,
      id: `step-${Date.now()}`,
      timestamp: new Date(),
    };
    setWorkflowSteps(prev => [...prev, newStep]);

    // Also add to protocol log
    const logEntry: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      protocol: step.protocol,
      message: step.action,
      status: step.status === "complete" ? "complete" : 
              step.status === "error" ? "alert" :
              step.status === "interrupted" ? "alert" : "active",
      details: step.details,
    };
    setLogEntries(prev => [logEntry, ...prev]);
    setActiveProtocol(step.protocol);
  }, []);

  // Update workflow step
  const updateWorkflowStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflowSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  }, []);

  // Process email workflow
  const processEmailWorkflow = useCallback(async (intent: ParsedIntent) => {
    setCurrentIntent(intent);
    setIsRunning(true);

    // Step 1: Contact discovery
    if (intent.recipients && intent.recipients.length > 0) {
      addWorkflowStep({
        protocol: "MCP",
        action: "Querying contact database...",
        status: "active",
      });

      // Search for each recipient
      for (const recipient of intent.recipients) {
        const contacts = await EmailAgentService.searchContacts(recipient);
        
        if (contacts.length === 0) {
          // No contacts found - might be a direct email
          if (recipient.includes("@")) {
            setResolvedRecipients(prev => [...prev, {
              id: `direct-${Date.now()}`,
              name: recipient.split("@")[0],
              email: recipient,
              source: "Direct",
            }]);
          } else {
            toast.error(`No contact found for "${recipient}"`);
          }
        } else if (contacts.length === 1) {
          // Single match
          setResolvedRecipients(prev => [...prev, contacts[0]]);
          addWorkflowStep({
            protocol: "MCP",
            action: `Resolved: ${contacts[0].name} (${contacts[0].email})`,
            status: "complete",
          });
        } else {
          // Multiple matches - need disambiguation
          addWorkflowStep({
            protocol: "A2A",
            action: `Disambiguation required for "${recipient}"`,
            status: "interrupted",
            details: `${contacts.length} contacts found`,
          });
          
          setPendingRecipients(intent.recipients.filter(r => r !== recipient));
          setDisambiguationData({
            ambiguousName: recipient,
            candidates: contacts,
          });
          setShowContactSelector(true);
          setIsRunning(false);
          return; // Pause workflow for user input
        }
      }
    }

    // Step 2: Generate draft
    await generateDraftFromIntent(intent);
  }, [addWorkflowStep]);

  // Generate draft from intent
  const generateDraftFromIntent = async (intent: ParsedIntent) => {
    addWorkflowStep({
      protocol: "A2A",
      action: "Generating email draft with Writer Agent...",
      status: "active",
    });

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const draft = await EmailAgentService.generateDraft(conversationHistory, {
        userProfile: defaultUserProfile,
        resolvedRecipients,
      });

      // Add signature from user profile
      draft.signature = `Best regards,\n${defaultUserProfile.name}\n${defaultUserProfile.designation || ""}\n${defaultUserProfile.company || ""}`;
      draft.to = resolvedRecipients.map(r => r.email);

      setCurrentDraft(draft);
      
      addWorkflowStep({
        protocol: "A2A",
        action: "Email draft generated",
        status: "complete",
      });

      // Show draft preview
      setShowDraftPreview(true);
      setIsRunning(false);

      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `I've drafted your email to ${resolvedRecipients.map(r => r.name).join(" and ")}. Please review the draft and let me know if you'd like any changes.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Draft generation error:", error);
      addWorkflowStep({
        protocol: "A2A",
        action: "Failed to generate draft",
        status: "error",
        details: error instanceof Error ? error.message : "Unknown error",
      });
      toast.error("Failed to generate email draft");
      setIsProcessing(false);
      setIsRunning(false);
    }
  };

  // Handle contact selection from disambiguation
  const handleContactSelected = async (contact: Contact) => {
    setShowContactSelector(false);
    setResolvedRecipients(prev => [...prev, contact]);
    
    addWorkflowStep({
      protocol: "A2A",
      action: `User selected: ${contact.name} (${contact.email})`,
      status: "complete",
    });

    // Continue with remaining recipients
    if (pendingRecipients.length > 0 && currentIntent) {
      processEmailWorkflow({
        ...currentIntent,
        recipients: pendingRecipients,
      });
    } else if (currentIntent) {
      // All recipients resolved, generate draft
      await generateDraftFromIntent(currentIntent);
    }
  };

  // Handle email refinement
  const handleRefineDraft = async (feedback: string) => {
    if (!currentDraft) return;
    
    setIsRefining(true);
    addWorkflowStep({
      protocol: "A2A",
      action: `Refining draft: "${feedback.slice(0, 50)}..."`,
      status: "active",
    });

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const result = await EmailAgentService.refineDraft(feedback, conversationHistory, {
        userProfile: defaultUserProfile,
        currentDraft,
        resolvedRecipients,
      });

      result.draft.signature = currentDraft.signature;
      result.draft.to = currentDraft.to;
      setCurrentDraft(result.draft);

      addWorkflowStep({
        protocol: "A2A",
        action: `Draft refined: ${result.changes.join(", ")}`,
        status: "complete",
      });

      toast.success("Draft updated!");
    } catch (error) {
      console.error("Refinement error:", error);
      toast.error("Failed to refine draft");
      addWorkflowStep({
        protocol: "A2A",
        action: "Failed to refine draft",
        status: "error",
      });
    } finally {
      setIsRefining(false);
    }
  };

  // Handle email send
  const handleSendEmail = async (draft: EmailDraft) => {
    setShowDraftPreview(false);
    
    addWorkflowStep({
      protocol: "AGP",
      action: "Sending email via Gmail API...",
      status: "active",
    });

    // In production, this would call Gmail MCP
    // For now, simulate success
    await new Promise(resolve => setTimeout(resolve, 1500));

    addWorkflowStep({
      protocol: "AGP",
      action: "Email sent successfully!",
      status: "complete",
      details: `To: ${draft.to.join(", ")}`,
    });

    toast.success("Email sent successfully!");

    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `✅ Email sent successfully to ${draft.to.join(", ")}!\n\nSubject: ${draft.subject}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);
    setIsRunning(false);
  };

  // Main send handler
  const handleSend = async () => {
    if (!input.trim()) return;
    if (isListening) stopListening();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    setIsRunning(true);

    // Add initial workflow step
    addWorkflowStep({
      protocol: "ANS",
      action: "Parsing user intent...",
      status: "active",
    });

    try {
      // Parse intent
      const intent = await EmailAgentService.parseIntent(input, {
        userProfile: defaultUserProfile,
      });

      addWorkflowStep({
        protocol: "ANS",
        action: `Intent detected: ${intent.action}`,
        status: "complete",
        details: intent.recipients?.length ? `Recipients: ${intent.recipients.join(", ")}` : undefined,
      });

      if (intent.action === "DRAFT_EMAIL" || intent.action === "REPLY_EMAIL") {
        // Clear previous state
        setResolvedRecipients([]);
        await processEmailWorkflow(intent);
      } else {
        // General chat
        addWorkflowStep({
          protocol: "A2A",
          action: "Processing with AI agent...",
          status: "active",
        });

        const conversationHistory = [...messages, userMessage].map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

        const response = await EmailAgentService.chat(conversationHistory, {
          userProfile: defaultUserProfile,
        });

        addWorkflowStep({
          protocol: "A2A",
          action: "Response generated",
          status: "complete",
        });

        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsRunning(false);
      }
    } catch (error) {
      console.error("Processing error:", error);
      
      addWorkflowStep({
        protocol: "ANS",
        action: "Error processing request",
        status: "error",
        details: error instanceof Error ? error.message : "Unknown error",
      });

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Failed to process request");
      setIsRunning(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setLogEntries([]);
    setAgents(initialAgents);
    setConnections(initialConnections);
    setActiveProtocol(null);
    setWorkflowSteps([]);
    setMessages([]);
    setCurrentIntent(null);
    setCurrentDraft(null);
    setResolvedRecipients([]);
    setPendingRecipients([]);
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
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Center Panel - Chat or Canvas */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border/30">
          {/* Panel Header with Tabs */}
          <div className="border-b border-border/30 px-6 py-3 flex items-center justify-between bg-card/30 backdrop-blur-sm">
            <div>
              <h2 className="text-xl font-semibold">
                {activeView === "chat" ? "Email Agent" : "Agent Orchestration Canvas"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeView === "chat" 
                  ? "Voice-first intelligent email automation" 
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
                        <h3 className="text-2xl font-bold text-foreground">Intelligent Email Agent</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Use voice or text to draft, review, and send emails. Try: 
                          <span className="block mt-2 text-primary font-medium">
                            "Draft an email to John and Priya about the project meeting"
                          </span>
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                          <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                            Voice Commands
                          </span>
                          <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                            Smart Disambiguation
                          </span>
                          <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                            Draft Refinement
                          </span>
                        </div>
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
                        <span className="text-sm text-muted-foreground">Processing your request...</span>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-border/30 p-4 bg-card/30">
                  {/* Voice Listening Indicator */}
                  <AnimatePresence>
                    {isListening && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 border border-primary/30"
                      >
                        <motion.div
                          className="w-3 h-3 rounded-full bg-red-500"
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-primary">Listening...</p>
                          {interimTranscript && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              "{interimTranscript}"
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stopListening}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          Stop
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3 items-end">
                    {/* Voice Input Button */}
                    {isVoiceSupported && (
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          variant={isListening ? "default" : "outline"}
                          size="lg"
                          onClick={toggleListening}
                          className={`relative ${
                            isListening 
                              ? "bg-red-500 hover:bg-red-600 text-white" 
                              : "border-border/50 hover:border-primary hover:bg-primary/10"
                          }`}
                        >
                          {isListening ? (
                            <>
                              <motion.div
                                className="absolute inset-0 rounded-md bg-red-500/50"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                              <MicOff className="w-5 h-5 relative z-10" />
                            </>
                          ) : (
                            <Mic className="w-5 h-5" />
                          )}
                        </Button>
                      </motion.div>
                    )}

                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isListening ? "Speak now..." : "Draft an email to John about the project meeting..."}
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
          <motion.div 
            className="w-[380px] min-w-[320px] flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {activeView === "chat" ? (
              <WorkflowLog />
            ) : (
              <ProtocolLog entries={logEntries} activeProtocol={activeProtocol} />
            )}
          </motion.div>
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

      {/* Contact Selector for Disambiguation */}
      {disambiguationData && (
        <ContactSelectorModal
          isOpen={showContactSelector}
          onClose={() => {
            setShowContactSelector(false);
            setDisambiguationData(null);
          }}
          onSelect={handleContactSelected}
          ambiguousName={disambiguationData.ambiguousName}
          candidates={disambiguationData.candidates}
        />
      )}

      {/* Email Draft Preview */}
      {currentDraft && (
        <EmailDraftPreviewModal
          isOpen={showDraftPreview}
          onClose={() => setShowDraftPreview(false)}
          onSend={handleSendEmail}
          onRefine={handleRefineDraft}
          draft={currentDraft}
          isRefining={isRefining}
        />
      )}
    </div>
  );
};
