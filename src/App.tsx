import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import SpaceAdmin from "./pages/SpaceAdmin";
import UnifiedAuth from "@/pages/UnifiedAuth";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import VerifyOTPLogin from "@/pages/VerifyOTPLogin";
import VerifyOTPSignup from "@/pages/VerifyOTPSignup";
import AppOnboarding from "@/pages/AppOnboarding";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Bookmarks from "./pages/Bookmarks";
import PostDetail from "./pages/PostDetail";

const queryClient = new QueryClient();

function PageTracker() {
  usePageTracking();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <PageTracker />
            <Routes>
              {/* 🔥 AUTHENTIFICATION */}
              <Route path="/auth" element={<UnifiedAuth />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/verify-otp-login" element={<VerifyOTPLogin />} />
              <Route path="/verify-otp-signup" element={<VerifyOTPSignup />} />
              
              {/* 🔥 ONBOARDING APP - Carousel de présentation */}
              <Route path="/app-onboarding" element={<AppOnboarding />} />
              
              {/* 🔥 REDIRECTIONS - Anciennes routes */}
              <Route path="/verify-otp" element={<Navigate to="/login" replace />} />
              <Route path="/profile-completion" element={<Navigate to="/signup" replace />} />
              <Route path="/register" element={<Navigate to="/signup" replace />} />
              <Route path="/phone-login" element={<Navigate to="/login" replace />} />
              <Route path="/onboarding" element={<Navigate to="/auth" replace />} />
              <Route path="/onboarding/name" element={<Navigate to="/signup" replace />} />
              <Route path="/onboarding/username" element={<Navigate to="/signup" replace />} />
              
              {/* Routes protégées avec layout */}
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
                <Route path="space/:spaceId/admin" element={<SpaceAdmin />} />
                <Route path="settings" element={<Settings />} />
                <Route path="search" element={<Search />} />
                <Route path="bookmarks" element={<Bookmarks />} />
              </Route>
              
              {/* Routes protégées sans layout (plein écran) */}
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
              
              {/* 404 - Page non trouvée */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <PWAPrompt />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
