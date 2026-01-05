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

// MCP Marketplace Modal
interface MCPItem {
  id: string;
  name: string;
  description: string;
  category: "data" | "tools" | "integrations" | "ai";
  icon: string;
  rating: number;
  downloads: string;
  installed: boolean;
  featured?: boolean;
  author: string;
}

interface MCPMarketplaceModalProps extends ModalProps {
  onInstall: (itemId: string) => void;
}

const mcpItems: MCPItem[] = [
  { id: "1", name: "PostgreSQL Connector", description: "Direct database access with read/write capabilities", category: "data", icon: "🗄️", rating: 4.9, downloads: "125K", installed: false, featured: true, author: "Supabase" },
  { id: "2", name: "Slack Integration", description: "Send messages and read channels in real-time", category: "integrations", icon: "💬", rating: 4.7, downloads: "89K", installed: true, author: "Slack" },
  { id: "3", name: "GitHub Actions", description: "Trigger workflows and manage repositories", category: "tools", icon: "🐙", rating: 4.8, downloads: "156K", installed: false, featured: true, author: "GitHub" },
  { id: "4", name: "OpenAI GPT-4", description: "Advanced language model for text generation", category: "ai", icon: "🤖", rating: 4.9, downloads: "234K", installed: true, author: "OpenAI" },
  { id: "5", name: "DALL-E 3", description: "Generate images from text descriptions", category: "ai", icon: "🎨", rating: 4.6, downloads: "67K", installed: false, author: "OpenAI" },
  { id: "6", name: "Zapier Hooks", description: "Connect to 5000+ apps via webhooks", category: "integrations", icon: "⚡", rating: 4.5, downloads: "45K", installed: false, author: "Zapier" },
  { id: "7", name: "REST API Builder", description: "Create and manage custom API endpoints", category: "tools", icon: "🌐", rating: 4.7, downloads: "78K", installed: false, author: "Postman" },
  { id: "8", name: "Vector Store", description: "Semantic search and embeddings storage", category: "data", icon: "📊", rating: 4.8, downloads: "92K", installed: false, featured: true, author: "Pinecone" },
  { id: "9", name: "Stripe Payments", description: "Process payments and manage subscriptions", category: "integrations", icon: "💳", rating: 4.9, downloads: "178K", installed: false, author: "Stripe" },
  { id: "10", name: "Claude 3.5", description: "Anthropic's most capable AI assistant", category: "ai", icon: "🧠", rating: 4.8, downloads: "145K", installed: false, featured: true, author: "Anthropic" },
];

const categories = [
  { id: "all", label: "All", icon: "🏠" },
  { id: "data", label: "Data Sources", icon: "🗄️" },
  { id: "tools", label: "Tools", icon: "🔧" },
  { id: "integrations", label: "Integrations", icon: "🔗" },
  { id: "ai", label: "AI Models", icon: "🤖" },
];

export const MCPMarketplaceModal = ({ 
  isOpen, 
  onClose, 
  onInstall
}: MCPMarketplaceModalProps) => {
  const [items, setItems] = useState<MCPItem[]>(mcpItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"browse" | "installed">("browse");

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesTab = activeTab === "browse" || item.installed;
    return matchesSearch && matchesCategory && matchesTab;
  });

  const featuredItems = items.filter(item => item.featured);

  const handleInstall = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, installed: !item.installed } : item
    ));
    onInstall(itemId);
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
            className="relative w-full max-w-4xl mx-4 bg-card border border-cyan-500/30 rounded-xl shadow-[0_0_50px_hsl(180_70%_50%/0.2)] overflow-hidden max-h-[85vh]"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 border-b border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xl"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🔌
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">MCP Marketplace</h3>
                    <p className="text-xs text-muted-foreground">Model Context Protocol Extensions</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Search Bar */}
              <div className="mt-4 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search connectors, tools, and integrations..."
                  className="w-full px-4 py-2.5 pl-10 rounded-lg bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setActiveTab("browse")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "browse" 
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  Browse All
                </button>
                <button
                  onClick={() => setActiveTab("installed")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "installed" 
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  Installed ({items.filter(i => i.installed).length})
                </button>
              </div>
            </div>

            <div className="flex max-h-[calc(85vh-180px)]">
              {/* Category Sidebar */}
              <div className="w-48 p-4 border-r border-border/50 overflow-y-auto">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Categories
                </p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.id 
                          ? "bg-cyan-500/20 text-cyan-400" 
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Featured Section */}
                <div className="mt-6">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    ⭐ Featured
                  </p>
                  <div className="space-y-2">
                    {featuredItems.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleInstall(item.id)}
                        className="w-full text-left p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-xs font-medium text-foreground truncate">{item.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Items Grid */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.03 }}
                        className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
                          item.installed 
                            ? "bg-cyan-500/5 border-cyan-500/30" 
                            : "bg-muted/30 border-border/50 hover:border-cyan-500/30"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                              item.installed ? "bg-cyan-500/20" : "bg-muted"
                            }`}>
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground text-sm">
                                {item.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">{item.author}</p>
                            </div>
                          </div>
                          {item.featured && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>⭐ {item.rating}</span>
                            <span>⬇️ {item.downloads}</span>
                          </div>
                          <Button
                            size="sm"
                            variant={item.installed ? "outline" : "default"}
                            onClick={() => handleInstall(item.id)}
                            className={`text-xs h-7 ${
                              item.installed 
                                ? "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" 
                                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                            }`}
                          >
                            {item.installed ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Installed
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3 mr-1" />
                                Install
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {filteredItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <span className="text-4xl mb-2">🔍</span>
                    <p className="text-sm">No connectors found</p>
                    <p className="text-xs">Try adjusting your search or category</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
