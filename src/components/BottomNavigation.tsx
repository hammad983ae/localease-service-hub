
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, User, HelpCircle, MessageCircle, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

const BottomNavigation: React.FC = () => {
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/bookings', icon: Calendar, label: 'Boekingen' },
    { path: '/chats', icon: MessageCircle, label: 'Berichten' },
    { path: '/quotes', icon: FileText, label: 'Offertes' },
    { path: '/profile', icon: User, label: 'Profiel' },
    { path: '/support', icon: HelpCircle, label: 'Support' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 nav-futuristic z-50">
      <div className="flex items-center justify-around px-2 py-2 max-w-7xl mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center space-y-1 p-3 rounded-2xl transition-all duration-300 min-w-0 flex-1 relative group",
                isActive
                  ? "text-primary bg-gradient-to-t from-primary/10 to-primary/5 scale-105 shadow-lg"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50/80 hover:scale-105"
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-300", 
                  isActive && "drop-shadow-sm scale-110"
                )} />
                
                {/* Notification badge for chats */}
                {item.path === '/chats' && unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>
              
              <span className="text-xs font-medium truncate">{item.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -bottom-1 w-12 h-1 bg-gradient-to-r from-primary to-blue-600 rounded-full shadow-sm"></div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
