import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Building, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/types/email-agent";

interface ContactSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (contact: Contact) => void;
  ambiguousName: string;
  candidates: Contact[];
}

export const ContactSelectorModal = ({
  isOpen,
  onClose,
  onSelect,
  ambiguousName,
  candidates,
}: ContactSelectorModalProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirm = () => {
    const selected = candidates.find(c => c.id === selectedId);
    if (selected) {
      onSelect(selected);
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
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md mx-4 bg-card border border-amber-500/30 rounded-xl shadow-[0_0_50px_hsl(45_70%_50%/0.2)] overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 border-b border-amber-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Disambiguation Required</h3>
                    <p className="text-xs text-muted-foreground">Multiple contacts found</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Info */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-sm text-foreground">
                  Found <span className="font-semibold text-amber-400">{candidates.length}</span> contacts 
                  matching "<span className="font-mono text-primary">{ambiguousName}</span>".
                  Please select the correct one:
                </p>
              </div>

              {/* Contact List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {candidates.map((contact) => (
                  <motion.button
                    key={contact.id}
                    onClick={() => setSelectedId(contact.id)}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      selectedId === contact.id
                        ? "bg-primary/10 border-primary/50"
                        : "bg-muted/30 border-border/50 hover:border-primary/30"
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedId === contact.id ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        {contact.avatar ? (
                          <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full" />
                        ) : (
                          <span className="text-lg font-semibold">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">{contact.name}</span>
                          {selectedId === contact.id && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                        {contact.source && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Building className="w-3 h-3" />
                            <span>{contact.source}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleConfirm}
                  disabled={!selectedId}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Selection
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
