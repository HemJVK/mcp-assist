import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { WorkflowLog } from "@/components/WorkflowLog";
import { Settings, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const AppPage = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          {/* Top Header Bar */}
          <header className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-sm font-medium text-muted-foreground">IntelliAgent Studio</h1>
            </div>

            <div className="flex items-center gap-2">
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

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Chat Interface - Takes 60% */}
            <div className="flex-1 min-w-0">
              <ChatInterface />
            </div>

            {/* Workflow Log Sidebar - Takes 40% */}
            <div className="w-[40%] border-l border-border/50 min-w-[400px] max-w-[600px]">
              <WorkflowLog />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppPage;
