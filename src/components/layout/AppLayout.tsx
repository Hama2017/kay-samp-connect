import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { BottomNavigation } from "./BottomNavigation";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background">
        {/* Header */}
        <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main content area with sidebar */}
        <div className="flex">
          <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
          
          {/* Main content */}
          <main className="flex-1 pb-16 min-h-[calc(100vh-4rem)]">
            <Outlet />
          </main>
        </div>
        
        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
}