import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Edit3, Mic, MicOff, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import type { EmailDraft } from "@/types/email-agent";

interface EmailDraftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (draft: EmailDraft) => void;
  onRefine: (feedback: string) => Promise<void>;
  draft: EmailDraft;
  isRefining?: boolean;
}

export const EmailDraftPreviewModal = ({
  isOpen,
  onClose,
  onSend,
  onRefine,
  draft,
  isRefining = false,
}: EmailDraftPreviewModalProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editedDraft, setEditedDraft] = useState<EmailDraft>(draft);
  const [refinementInput, setRefinementInput] = useState("");

  const {
    isListening,
    isSupported,
    toggleListening,
    stopListening,
    interimTranscript,
  } = useVoiceInput({
    onTranscript: (text) => {
      setRefinementInput(prev => prev + (prev ? " " : "") + text);
    },
    continuous: true,
  });

  // Sync draft when it changes from parent
  useState(() => {
    setEditedDraft(draft);
  });

  const handleRefine = async () => {
    if (!refinementInput.trim()) return;
    if (isListening) stopListening();
    await onRefine(refinementInput);
    setRefinementInput("");
  };

  const handleSend = () => {
    onSend(editMode ? editedDraft : draft);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl mx-4 bg-card border border-primary/30 rounded-xl shadow-[0_0_50px_hsl(var(--primary)/0.2)] overflow-hidden max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 border-b border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email Draft Preview</h3>
                    <p className="text-xs text-muted-foreground">Review before sending</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    className="gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    {editMode ? "Preview" : "Edit"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* To Field */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">To</Label>
                {editMode ? (
                  <Input
                    value={editedDraft.to.join(", ")}
                    onChange={(e) => setEditedDraft({
                      ...editedDraft,
                      to: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    })}
                    className="bg-muted/50"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {draft.to.map((email, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-mono"
                      >
                        {email}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject Field */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Subject</Label>
                {editMode ? (
                  <Input
                    value={editedDraft.subject}
                    onChange={(e) => setEditedDraft({ ...editedDraft, subject: e.target.value })}
                    className="bg-muted/50 font-medium"
                  />
                ) : (
                  <p className="text-foreground font-medium">{draft.subject}</p>
                )}
              </div>

              {/* Body Field */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Body</Label>
                {editMode ? (
                  <Textarea
                    value={editedDraft.body}
                    onChange={(e) => setEditedDraft({ ...editedDraft, body: e.target.value })}
                    className="bg-muted/50 min-h-[200px]"
                  />
                ) : (
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-foreground whitespace-pre-wrap">{draft.body}</p>
                    {draft.signature && (
                      <div className="mt-4 pt-4 border-t border-border/30 text-muted-foreground text-sm">
                        {draft.signature}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Voice Refinement Section */}
              {!editMode && (
                <div className="pt-4 border-t border-border/30 space-y-3">
                  <Label className="text-sm text-foreground flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refine with voice or text
                  </Label>
                  
                  {/* Listening indicator */}
                  <AnimatePresence>
                    {isListening && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 border border-primary/30"
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
                          className="text-red-400 hover:text-red-300"
                        >
                          Stop
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-2">
                    {isSupported && (
                      <Button
                        variant={isListening ? "default" : "outline"}
                        size="icon"
                        onClick={toggleListening}
                        className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
                        disabled={isRefining}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                    )}
                    <Input
                      value={refinementInput}
                      onChange={(e) => setRefinementInput(e.target.value)}
                      placeholder="e.g., Make it more urgent and mention the deadline"
                      className="flex-1 bg-muted/50"
                      onKeyDown={(e) => e.key === "Enter" && handleRefine()}
                      disabled={isRefining}
                    />
                    <Button 
                      onClick={handleRefine}
                      disabled={!refinementInput.trim() || isRefining}
                      className="gap-2"
                    >
                      {isRefining ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Refine
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-border/30 bg-card/50 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent"
                onClick={handleSend}
              >
                <Send className="w-4 h-4" />
                Send Email
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
