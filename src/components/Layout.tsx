
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

const Layout: React.FC = () => {
  const location = useLocation();
  const hideNavigation = location.pathname === '/' || location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {!hideNavigation && <Header />}
      <main className="flex-1 pb-20"> {/* Increased bottom padding for better spacing */}
        <Outlet />
      </main>
      {!hideNavigation && <BottomNavigation />}
    </div>
  );
};

export default Layout;
