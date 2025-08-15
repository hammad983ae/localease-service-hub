
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, MessageCircle, User, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border/50 shadow-2xl">
      <div className="container-modern">
        <div className="flex items-center justify-around py-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-300 min-w-0 flex-1 relative group",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-300",
                to === '/chats' && unreadCount > 0 ? "animate-pulse" : ""
              )}>
                <Icon className="h-5 w-5" />
                {to === '/chats' && unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold min-w-[20px] animate-bounce"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
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
