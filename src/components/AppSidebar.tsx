import { Home, MessageSquare, Cpu, LayoutDashboard, FileText, Sparkles, Shield, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/intelliagent-logo.png";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Chat", url: "/app", icon: MessageSquare },
  { title: "Command Center", url: "/app/command", icon: Cpu },
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Documentation", url: "/docs", icon: FileText },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar">
      <SidebarContent className="pt-4">
        {/* Logo/Brand */}
        <div className="px-6 pb-6 flex items-center gap-3">
          <img src={logo} alt="IntelliAgent" className="w-8 h-8" />
          {open && (
            <span className="text-lg font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              IntelliAgent
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider px-6">
            {open ? "Navigation" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Toggle button at bottom */}
      <div className="border-t border-border/50 p-4">
        <SidebarTrigger className="w-full" />
      </div>
    </Sidebar>
  );
}
