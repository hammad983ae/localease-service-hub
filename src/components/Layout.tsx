
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

const Layout: React.FC = () => {
  const location = useLocation();
  const hideNavigation = location.pathname === '/' || location.pathname === '/auth';

  return (
    <div className="saas-layout">
      {/* Modern background with subtle gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Floating background elements */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '-3s' }} />
      
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
