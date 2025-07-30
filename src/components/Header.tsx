
import React from 'react';
import { ArrowLeft, User, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/home';

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/home':
        return null;
      case '/bookings':
        return 'My Bookings';
      case '/profile':
        return 'Profile';
      case '/support':
        return 'Support';
      case '/moving':
        return 'Moving Service';
      case '/disposal':
        return 'Disposal Service';
      case '/transport':
        return 'Transport Service';
      default:
        return 'LocalEase';
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/50 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
      <div className="relative flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {!isHomePage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10 rounded-xl neon-border border-primary/30 hover:border-primary/60 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {isHomePage ? (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg glow-primary">
                  <span className="text-lg font-bold text-white">L</span>
                </div>
                <div className="absolute inset-0 w-10 h-10 gradient-primary rounded-xl animate-pulse-glow opacity-50" />
              </div>
              <span className="text-2xl font-bold holographic-text">
                LocalEase
              </span>
            </div>
          ) : (
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {getPageTitle()}
            </h1>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/10 rounded-xl neon-border border-primary/30 hover:border-primary/60 transition-all duration-300 relative group"
          >
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse-glow" />
            <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            title="Profile"
            className="hover:bg-primary/10 rounded-xl neon-border border-primary/30 hover:border-primary/60 transition-all duration-300 relative group"
          >
            <User className="h-5 w-5" />
            <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
