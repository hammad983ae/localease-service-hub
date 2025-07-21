
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

const Layout: React.FC = () => {
  const location = useLocation();
  const hideNavigation = location.pathname === '/onboarding';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideNavigation && <Header />}
      <main className="flex-1 pb-16 flex justify-center">
        <div className="w-full max-w-lg mx-auto">
          <Outlet />
        </div>
      </main>
      {!hideNavigation && <BottomNavigation />}
    </div>
  );
};

export default Layout;
