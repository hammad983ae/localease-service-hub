
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { useOnboardingStatus } from "./hooks/useOnboardingStatus";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Moving from "./pages/Moving";
import Disposal from "./pages/Disposal";
import Transport from "./pages/Transport";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading: authLoading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();

  if (authLoading || (user && onboardingLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
      <Route 
        path="/onboarding" 
        element={
          user ? (
            onboardingCompleted === false ? <Onboarding /> : <Navigate to="/" replace />
          ) : (
            <Navigate to="/auth" />
          )
        } 
      />
      <Route path="/" element={<Layout />}>
        <Route 
          index 
          element={
            <ProtectedRoute>
              {user && onboardingCompleted === false ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Home />
              )}
            </ProtectedRoute>
          } 
        />
        <Route path="moving" element={<ProtectedRoute><Moving /></ProtectedRoute>} />
        <Route path="disposal" element={<ProtectedRoute><Disposal /></ProtectedRoute>} />
        <Route path="transport" element={<ProtectedRoute><Transport /></ProtectedRoute>} />
        <Route path="bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
