
import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';

const Layout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pb-28 pb-safe sm:pb-32 overflow-hidden">
        <div className="h-full overflow-y-auto scroll-smooth">
          <Outlet />
        </div>
      </main>
      {user && <BottomNavigation />}
    </div>
  );
};

export default Layout;
