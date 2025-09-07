import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { PWAPrompt } from "@/components/PWAPrompt";
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
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="discover" element={<Discover />} />
              <Route path="create-space" element={<CreateSpace />} />
              <Route path="trending" element={<Trending />} />
              <Route path="profile" element={<Profile />} />
              <Route path="user/:username" element={<UserProfile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="space/:spaceId" element={<SpaceDetail />} />
              <Route path="settings" element={<Settings />} />
              <Route path="search" element={<Search />} />
            </Route>
            
            {/* Protected routes without layout for full screen pages */}
            <Route path="create-post" element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } />
            <Route path="space/:spaceId/create-post" element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PWAPrompt />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;