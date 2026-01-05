import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CommandCenter } from "@/components/agentic/CommandCenter";
import { Settings, HelpCircle, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const AppPage = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background dark">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          {/* Top Header Bar */}
          <header className="h-14 border-b border-border/30 flex items-center justify-between px-6 bg-card/30 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-2 h-2 rounded-full bg-green-500"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <h1 className="text-sm font-medium text-muted-foreground">
                  Agentic UI Command Center
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mr-4">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-xs font-mono text-primary">2025 Standardized Stack</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Main Content Area - Command Center */}
          <div className="flex-1 overflow-hidden">
            <CommandCenter />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppPage;
