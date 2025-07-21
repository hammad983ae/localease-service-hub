
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Layout from "./components/Layout";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Moving from "./pages/Moving";
import Disposal from "./pages/Disposal";
import Transport from "./pages/Transport";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Check if user has completed onboarding
  const hasCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<Layout />}>
                <Route index element={hasCompletedOnboarding ? <Home /> : <Navigate to="/onboarding" />} />
                <Route path="moving" element={<Moving />} />
                <Route path="disposal" element={<Disposal />} />
                <Route path="transport" element={<Transport />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="support" element={<Support />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
