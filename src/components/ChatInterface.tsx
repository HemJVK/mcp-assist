import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

    // Simulate AI processing
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand your request. I'll help you automate this task using LLMs and MCPs.",
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
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-border/50 px-6 py-4">
        <h2 className="text-xl font-semibold">Chat prompt</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Intelligent automation for optimizing processes
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Start a conversation</h3>
              <p className="text-muted-foreground">
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
      <div className="border-t border-border/50 p-6">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Draft a mail to xyz@gmail.com on updating their Jira Status for PROJ-1234"
            className="min-h-[80px] resize-none bg-muted/50 border-border/50 focus:border-primary transition-colors"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="self-end px-6 bg-gradient-to-r from-primary via-accent to-secondary hover:shadow-glow transition-all"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
