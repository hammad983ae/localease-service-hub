
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

const Layout: React.FC = () => {
  const location = useLocation();
  const hideNavigation = location.pathname === '/' || location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-background flex flex-col relative overflow-hidden">
      {/* Futuristic background elements */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {!hideNavigation && <Header />}
        <main className="flex-1 pb-20">
          <Outlet />
        </main>
        {!hideNavigation && <BottomNavigation />}
      </div>
    </div>
  );
};

export default Layout;
