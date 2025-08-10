
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, MessageCircle, User, Settings } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const BottomNavigation: React.FC = () => {
  const { unreadCount } = useNotifications();

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/bookings', icon: Calendar, label: 'Bookings' },
    { to: '/chats', icon: MessageCircle, label: 'Chats' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/admin', icon: Settings, label: 'Admin' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="container-modern">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `bottom-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="nav-icon">
                <Icon className="h-5 w-5" />
                {to === '/chats' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold flex items-center justify-center animate-bounce-in">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
