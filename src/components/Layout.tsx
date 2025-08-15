
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

const Layout: React.FC = () => {
  const location = useLocation();
  const hideNavigation = location.pathname === '/' || location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-background">
      {/* Modern SaaS layout with consistent styling */}
      <div className="relative">
        {/* Subtle background gradients */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative flex flex-col min-h-screen">
          {!hideNavigation && <Header />}
          <main className="flex-1 pb-20">
            <Outlet />
          </main>
          {!hideNavigation && <BottomNavigation />}
        </div>
      </div>
    </div>
  );
};

export default Layout;
