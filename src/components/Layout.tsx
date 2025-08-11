
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
