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
      {/* STRUCTURE SIMPLE - PAS DE POSITION FIXED GLOBALE */}
      <div className="min-h-screen w-full bg-background">
        
        {/* HEADER FIXE */}
        <div className="navbar-mobile safe-area-top">
          <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* SIDEBAR */}
        <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        {/* CONTENU PRINCIPAL AVEC MARGINS */}
        <main className="content-mobile">
          <Outlet />
        </main>

        {/* NAVIGATION BOTTOM FIXE */}
        <div className="bottom-nav-mobile safe-area-bottom">
          <BottomNavigation />
        </div>
      </div>
    </SidebarProvider>
  );
}