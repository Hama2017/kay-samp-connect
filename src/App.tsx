import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import CreateSpace from "./pages/CreateSpace";
import CreatePost from "./pages/CreatePost";
import Trending from "./pages/Trending";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Notifications from "./pages/Notifications";
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
            <Route path="create-space" element={<CreateSpace />} />
            <Route path="trending" element={<Trending />} />
            <Route path="profile" element={<Profile />} />
            <Route path="user/:username" element={<UserProfile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="space/:spaceId" element={<SpaceDetail />} />
          </Route>
          {/* Routes without layout for full screen pages */}
          <Route path="create-post" element={<CreatePost />} />
          <Route path="space/:spaceId/create-post" element={<CreatePost />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
