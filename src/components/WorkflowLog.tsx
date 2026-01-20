import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, Loader2, Mail, Sparkles, User, Shield, AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface WorkflowLogEntry {
  id: string;
  message: string;
  timestamp: Date;
  status: "pending" | "processing" | "completed" | "error";
  icon: "user" | "ai" | "system" | "mail";
  details?: string;
}

const iconMap = {
  user: User,
  ai: Sparkles,
  system: Shield,
  mail: Mail,
};

interface WorkflowLogProps {
  logs: WorkflowLogEntry[];
}

export function WorkflowLog({ logs }: WorkflowLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
      <div className="border-b border-border/50 px-6 py-4">
        <h3 className="text-lg font-semibold">Task Execution Log</h3>
        <p className="text-sm text-muted-foreground mt-1">Real-time workflow monitoring</p>
      </div>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {logs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Waiting for workflow to start...</p>
              </motion.div>
            ) : (
              logs.map((log, index) => {
                const Icon = iconMap[log.icon];
                const StatusIcon =
                  log.status === "completed"
                    ? CheckCircle2
                    : log.status === "processing"
                    ? Loader2
                    : log.status === "error"
                    ? AlertCircle
                    : Circle;

                return (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-4 group"
                  >
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                          log.status === "completed"
                            ? "bg-primary/10 border-primary text-primary"
                            : log.status === "processing"
                            ? "bg-accent/10 border-accent text-accent"
                            : log.status === "error"
                            ? "bg-destructive/10 border-destructive text-destructive"
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
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-relaxed">{log.message}</p>
                          {log.details && (
                            <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                          )}
                        </div>
                        <StatusIcon
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            log.status === "processing" ? "animate-spin" : ""
                          } ${
                            log.status === "completed"
                              ? "text-primary"
                              : log.status === "processing"
                              ? "text-accent"
                              : log.status === "error"
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  );
}
