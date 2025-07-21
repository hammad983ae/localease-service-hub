
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, User, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const BottomNavigation: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/bookings', icon: Calendar, label: t('nav.bookings') },
    { path: '/profile', icon: User, label: t('nav.profile') },
    { path: '/support', icon: HelpCircle, label: t('nav.support') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
