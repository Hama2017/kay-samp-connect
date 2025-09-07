import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import CreateSpace from "./pages/CreateSpace";
import Trending from "./pages/Trending";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import SpaceDetail from "./pages/SpaceDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="discover" element={<Discover />} />
            <Route path="create" element={<CreateSpace />} />
            <Route path="trending" element={<Trending />} />
            <Route path="profile" element={<Profile />} />
            <Route path="space/:spaceId" element={<SpaceDetail />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
