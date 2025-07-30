
import React from 'react';
import { ArrowLeft, User, Bell, Sparkles } from 'lucide-react';
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
        return 'Mijn Boekingen';
      case '/profile':
        return 'Profiel';
      case '/support':
        return 'Ondersteuning';
      case '/moving':
        return 'Verhuisservice';
      case '/disposal':
        return 'Afvalservice';
      case '/transport':
        return 'Transportservice';
      case '/chats':
        return 'Berichten';
      case '/quotes':
        return 'Offertes';
      default:
        return 'LocalEase';
    }
  };

  return (
    <header className="nav-futuristic sticky top-0 z-50">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          {!isHomePage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10 rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
          )}
          {isHomePage ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">L</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  LocalEase
                </span>
                <span className="text-xs text-gray-500 font-medium">AI-Powered Platform</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-gray-900">{getPageTitle()}</h1>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/10 rounded-2xl relative transition-all duration-300 hover:scale-105"
          >
            <Bell className="h-5 w-5 text-gray-700" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg animate-pulse"></div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            title="Profiel"
            className="hover:bg-primary/10 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <User className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
