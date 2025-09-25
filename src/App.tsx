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
import VerifyOTP from "@/pages/VerifyOTP";
import ProfileCompletion from "@/pages/ProfileCompletion";
import AppOnboarding from "@/pages/AppOnboarding";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Bookmarks from "./pages/Bookmarks";
import PostDetail from "./pages/PostDetail";

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
            {/* 🔥 AUTHENTIFICATION - Route unique par téléphone */}
            <Route path="/auth" element={<UnifiedAuth />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            
            {/* 🔥 COMPLÉTION PROFIL - Page unique pour nom + username */}
            <Route path="/profile-completion" element={<ProfileCompletion />} />
            
            {/* 🔥 ONBOARDING APP - Carousel de présentation (3 étapes) */}
            <Route path="/app-onboarding" element={<AppOnboarding />} />
            
            {/* 🔥 REDIRECTIONS - Anciennes routes → Nouvelle route auth */}
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/register" element={<Navigate to="/auth" replace />} />
            <Route path="/phone-login" element={<Navigate to="/auth" replace />} />
            <Route path="/onboarding" element={<Navigate to="/auth" replace />} />
            <Route path="/onboarding/name" element={<Navigate to="/profile-completion" replace />} />
            <Route path="/onboarding/username" element={<Navigate to="/profile-completion" replace />} />
            
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

export default App;