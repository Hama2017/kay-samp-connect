import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { PWAPrompt } from "@/components/PWAPrompt";
import { usePageTracking } from "@/hooks/usePageTracking";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import CreateSpace from "./pages/CreateSpace";
import CreatePost from "./pages/CreatePost";
import Trending from "./pages/Trending";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import SpaceDetail from "./pages/SpaceDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PhoneLogin from "@/pages/PhoneLogin";
import VerifyOTP from "@/pages/VerifyOTP";
import Onboarding from "@/pages/Onboarding";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Bookmarks from "./pages/Bookmarks";
import PostDetail from "./pages/PostDetail";

// Composant pour tracker les pages
function PageTracker() {
  usePageTracking();
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <PageTracker />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/phone-login" element={<PhoneLogin />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/onboarding" element={<Onboarding />} />
            
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
              <Route path="post/:id" element={<PostDetail />} />
              <Route path="space/:spaceId" element={<SpaceDetail />} />
              <Route path="settings" element={<Settings />} />
              <Route path="search" element={<Search />} />
              <Route path="bookmarks" element={<Bookmarks />} />
            </Route>
            
            {/* Protected routes without layout for full screen pages */}
            <Route path="create-post" element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } />
            <Route path="create/:spaceId" element={
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