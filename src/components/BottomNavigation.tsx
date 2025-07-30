
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
    { path: '/home', icon: Home, label: t('nav.home') },
    { path: '/bookings', icon: Calendar, label: t('nav.bookings') },
    { path: '/chats', icon: MessageCircle, label: t('nav.chats') },
    { path: '/quotes', icon: FileText, label: t('nav.quotes') },
    { path: '/profile', icon: User, label: t('nav.profile') },
    { path: '/support', icon: HelpCircle, label: t('nav.support') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-border/50 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <div className="relative flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-300 min-w-0 flex-1 relative group",
                isActive
                  ? "text-primary scale-110 transform"
                  : "text-muted-foreground hover:text-primary hover:scale-105"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-lg transition-all duration-300",
                isActive 
                  ? "bg-primary/20 neon-border border-primary/50 glow-primary" 
                  : "hover:bg-primary/10 border border-transparent hover:border-primary/30"
              )}>
                <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
                {isActive && (
                  <div className="absolute inset-0 rounded-lg bg-primary/10 animate-pulse-glow" />
                )}
              </div>
              
              <span className={cn(
                "text-xs font-medium truncate transition-all duration-300",
                isActive && "text-primary font-semibold"
              )}>
                {item.label}
              </span>
              
              {/* Notification badge for chats */}
              {item.path === '/chats' && unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse-glow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
              
              {isActive && (
                <>
                  <div className="absolute -bottom-1 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
                  <div className="absolute inset-0 rounded-xl bg-primary/5 animate-pulse opacity-50" />
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
