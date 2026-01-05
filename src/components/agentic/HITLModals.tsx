import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Wallet, 
  Settings, 
  X, 
  AlertTriangle,
  Check,
  Edit3,
  Plus,
  Trash2,
  Lock
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// AP2 Mandate Modal - Payment Authorization
interface AP2MandateModalProps extends ModalProps {
  onSign: (budget: number) => void;
  requestedAmount?: number;
  recipient?: string;
}

export const AP2MandateModal = ({ 
  isOpen, 
  onClose, 
  onSign, 
  requestedAmount = 100, 
  recipient = "External Agent" 
}: AP2MandateModalProps) => {
  const [maxBudget, setMaxBudget] = useState(requestedAmount);

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
            className="relative w-full max-w-md mx-4 bg-card border border-green-500/30 rounded-xl shadow-[0_0_50px_hsl(142_70%_45%/0.2)] overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Glowing header */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 border-b border-green-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">[AP2] Payment Mandate</h3>
                    <p className="text-xs text-muted-foreground">Authorization Required</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Recipient Info */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Requesting Agent</span>
                  <span className="text-sm font-mono text-foreground">{recipient}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Requested Amount</span>
                  <span className="text-sm font-mono text-green-400">${requestedAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Budget Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-foreground">Max Budget Limit</Label>
                  <span className="text-lg font-bold text-green-400">${maxBudget.toFixed(2)}</span>
                </div>
                <Slider
                  value={[maxBudget]}
                  onValueChange={([value]) => setMaxBudget(value)}
                  max={500}
                  min={10}
                  step={10}
                  className="py-4"
                />
                <p className="text-xs text-muted-foreground">
                  Set the maximum spending limit for this agent mandate.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Decline
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onSign(maxBudget)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Sign Mandate
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// AGP Intercept Modal - Security Firewall
interface AGPInterceptModalProps extends ModalProps {
  onAllow: () => void;
  onModify: (modifiedData: string) => void;
  redactedData?: string;
  destination?: string;
}

export const AGPInterceptModal = ({ 
  isOpen, 
  onClose, 
  onAllow, 
  onModify,
  redactedData = "████████ API_KEY ████████",
  destination = "external-api.example.com"
}: AGPInterceptModalProps) => {
  const [editMode, setEditMode] = useState(false);
  const [modifiedData, setModifiedData] = useState(redactedData);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-md mx-4 bg-card border border-red-500/30 rounded-xl shadow-[0_0_50px_hsl(0_70%_50%/0.2)] overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Alert header */}
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-4 border-b border-red-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Shield className="w-5 h-5 text-red-400" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-foreground">[AGP] Security Intercept</h3>
                    <p className="text-xs text-muted-foreground">Outbound Data Review</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Warning */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">
                  Sensitive data detected in outbound message. Review before allowing transmission.
                </p>
              </div>

              {/* Destination */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Destination</span>
                <span className="text-sm font-mono text-amber-400">{destination}</span>
              </div>

              {/* Redacted Data */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-foreground">Redacted Content</Label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    className="h-7 text-xs"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    {editMode ? "Done" : "Modify"}
                  </Button>
                </div>
                {editMode ? (
                  <Input 
                    value={modifiedData}
                    onChange={(e) => setModifiedData(e.target.value)}
                    className="font-mono text-sm bg-muted/50"
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm text-red-300 border border-red-500/20">
                    {modifiedData}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Block
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                  onClick={() => onModify(modifiedData)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Send Modified
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={onAllow}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Allow
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// MCP Config Modal
interface MCPConfigModalProps extends ModalProps {
  onSave: (config: { resources: string[]; tools: string[] }) => void;
  initialResources?: string[];
  initialTools?: string[];
}

export const MCPConfigModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  initialResources = [],
  initialTools = []
}: MCPConfigModalProps) => {
  const [resources, setResources] = useState<string[]>(initialResources);
  const [tools, setTools] = useState<string[]>(initialTools);
  const [newResource, setNewResource] = useState("");
  const [newTool, setNewTool] = useState("");

  const addResource = () => {
    if (newResource.trim()) {
      setResources([...resources, newResource.trim()]);
      setNewResource("");
    }
  };

  const addTool = () => {
    if (newTool.trim()) {
      setTools([...tools, newTool.trim()]);
      setNewTool("");
    }
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
          <motion.div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-lg mx-4 bg-card border border-blue-500/30 rounded-xl shadow-[0_0_50px_hsl(217_90%_60%/0.2)] overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-4 border-b border-blue-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">[MCP] Configuration</h3>
                    <p className="text-xs text-muted-foreground">Model Context Protocol Setup</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Resource URIs */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Resource URIs</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newResource}
                    onChange={(e) => setNewResource(e.target.value)}
                    placeholder="file://./data/context.json"
                    className="flex-1 font-mono text-sm"
                    onKeyDown={(e) => e.key === "Enter" && addResource()}
                  />
                  <Button size="icon" onClick={addResource} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {resources.map((uri, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <span className="text-sm font-mono text-muted-foreground truncate flex-1 mr-2">{uri}</span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-300"
                        onClick={() => setResources(resources.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Tools</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    placeholder="web_search, code_interpreter"
                    className="flex-1 font-mono text-sm"
                    onKeyDown={(e) => e.key === "Enter" && addTool()}
                  />
                  <Button size="icon" onClick={addTool} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30"
                    >
                      <span className="text-xs font-mono text-blue-300">{tool}</span>
                      <button 
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => setTools(tools.filter((_, idx) => idx !== i))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/30 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => onSave({ resources, tools })}
              >
                Save Configuration
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
