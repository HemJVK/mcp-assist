import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, Loader2, Mail, Sparkles, User, Shield } from "lucide-react";
import { useState, useEffect } from "react";

interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
  status: "pending" | "processing" | "completed";
  icon: "user" | "ai" | "system" | "mail";
}

const iconMap = {
  user: User,
  ai: Sparkles,
  system: Shield,
  mail: Mail,
};

export function WorkflowLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Simulate log entries
  useEffect(() => {
    const sampleLogs: LogEntry[] = [
      {
        id: "1",
        message: "User input received. Sending API request...",
        timestamp: new Date().toLocaleTimeString(),
        status: "completed",
        icon: "user",
      },
      {
        id: "2",
        message: "Task created (simulated).",
        timestamp: new Date().toLocaleTimeString(),
        status: "completed",
        icon: "system",
      },
      {
        id: "3",
        message: "Agent Activation: Agent service picks up the job (simulated).",
        timestamp: new Date().toLocaleTimeString(),
        status: "completed",
        icon: "system",
      },
      {
        id: "4",
        message: "LLM Action: Generating draft using Gemini...",
        timestamp: new Date().toLocaleTimeString(),
        status: "completed",
        icon: "ai",
      },
      {
        id: "5",
        message: "Draft generated. Awaiting user approval.",
        timestamp: new Date().toLocaleTimeString(),
        status: "completed",
        icon: "mail",
      },
      {
        id: "6",
        message: "User approved. Preparing to send email...",
        timestamp: new Date().toLocaleTimeString(),
        status: "processing",
        icon: "system",
      },
      {
        id: "7",
        message: "Requesting Google authentication...",
        timestamp: new Date().toLocaleTimeString(),
        status: "pending",
        icon: "system",
      },
    ];
    setLogs(sampleLogs);
  }, []);

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
      <div className="border-b border-border/50 px-6 py-4">
        <h3 className="text-lg font-semibold">Task Execution Log</h3>
        <p className="text-sm text-muted-foreground mt-1">Real-time workflow monitoring</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {logs.map((log, index) => {
            const Icon = iconMap[log.icon];
            const StatusIcon =
              log.status === "completed"
                ? CheckCircle2
                : log.status === "processing"
                ? Loader2
                : Circle;

            return (
              <div key={log.id} className="flex items-start gap-4 group">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      log.status === "completed"
                        ? "bg-primary/10 border-primary text-primary"
                        : log.status === "processing"
                        ? "bg-accent/10 border-accent text-accent"
                        : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {index < logs.length - 1 && (
                    <div className="w-px h-12 bg-border/50 my-1" />
                  )}
                </div>

                {/* Log content */}
                <div className="flex-1 pt-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-relaxed">{log.message}</p>
                    <StatusIcon
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        log.status === "processing" ? "animate-spin" : ""
                      } ${
                        log.status === "completed"
                          ? "text-primary"
                          : log.status === "processing"
                          ? "text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
