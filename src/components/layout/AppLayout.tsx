import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { BottomNavigation } from "./BottomNavigation";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mobile-container">
      {/* Header fixe en haut */}
      <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sidebar */}
      <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Contenu principal scrollable */}
      <main className="content-mobile">
        <Outlet />
      </main>

      {/* Bottom nav fixe */}
      <BottomNavigation />
    </div>
  );
}
