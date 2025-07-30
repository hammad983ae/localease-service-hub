
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
        return null; // Show logo instead
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {!isHomePage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-gray-100 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {isHomePage ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">L</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                LocalEase
              </span>
            </div>
          ) : (
            <h1 className="text-lg font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 rounded-xl relative"
          >
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            title="Profile"
            className="hover:bg-gray-100 rounded-xl"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
