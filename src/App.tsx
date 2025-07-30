
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Moving from "./pages/Moving";
import Disposal from "./pages/Disposal";
import Transport from "./pages/Transport";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import Chats from "./pages/Chats";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import CompanyOnboarding from "./pages/CompanyOnboarding";
import CompanyDashboard from "./pages/CompanyDashboard";
import QuoteDocuments from "./components/QuoteDocuments";
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationSound from './components/NotificationSound';
import FloatingChatWidget from './components/FloatingChatWidget';

const queryClient = new QueryClient();

// Protected route for admin users
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
};

// Protected route for company users
const ProtectedCompanyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || user.role !== 'company') {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <NotificationProvider>
              <NotificationSound />
              <BrowserRouter>
                <FloatingChatWidget />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />
                  <Route path="/company-onboarding" element={<ProtectedCompanyRoute><CompanyOnboarding /></ProtectedCompanyRoute>} />
                  <Route path="/company-dashboard" element={<ProtectedCompanyRoute><CompanyDashboard /></ProtectedCompanyRoute>} />
                  <Route path="/" element={<Layout />}>
                    <Route path="home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="moving" element={<ProtectedRoute><Moving /></ProtectedRoute>} />
                    <Route path="disposal" element={<ProtectedRoute><Disposal /></ProtectedRoute>} />
                    <Route path="transport" element={<ProtectedRoute><Transport /></ProtectedRoute>} />
                    <Route path="bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                    <Route path="chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
                    <Route path="quotes" element={<ProtectedRoute><QuoteDocuments /></ProtectedRoute>} />
                    <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </AuthProvider>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
