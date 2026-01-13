import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CommandCenter } from "@/components/agentic/CommandCenter";
import { Settings, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const AppPage = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Bar */}
          <header className="h-12 border-b border-border/30 flex items-center justify-between px-4 bg-card/30 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-8 w-8" />
              <span className="text-sm font-medium text-muted-foreground">IntelliAgent Studio</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <HelpCircle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden">
            <CommandCenter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppPage;
