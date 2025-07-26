
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, User, HelpCircle, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

const BottomNavigation: React.FC = () => {
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: t('nav.home') }, // Fixed: changed from '/' to '/home'
    { path: '/bookings', icon: Calendar, label: t('nav.bookings') },
    { path: '/chats', icon: MessageCircle, label: 'Chats' },
    { path: '/profile', icon: User, label: t('nav.profile') },
    { path: '/support', icon: HelpCircle, label: t('nav.support') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-300 min-w-0 flex-1 relative",
                isActive
                  ? "text-primary bg-gradient-to-t from-blue-50 to-transparent scale-105"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
              <span className="text-xs font-medium truncate">{item.label}</span>
              
              {/* Notification badge for chats */}
              {item.path === '/chats' && unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
              
              {isActive && (
                <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
