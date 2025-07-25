
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

const Layout: React.FC = () => {
  const location = useLocation();
  const hideNavigation = location.pathname === '/' || location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideNavigation && <Header />}
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      {!hideNavigation && <BottomNavigation />}
    </div>
  );
};

export default Layout;
