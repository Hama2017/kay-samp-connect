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
        
        {/* HEADER FIXE */}
        <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* SIDEBAR */}
        <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        {/* CONTENU PRINCIPAL - Responsive avec safe areas iPhone */}
        <main className="pt-16 pb-[calc(5rem+env(safe-area-inset-bottom))] min-h-screen">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>

        {/* NAVIGATION BOTTOM FIXE */}
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
}