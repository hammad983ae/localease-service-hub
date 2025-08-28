
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageCircle, User, Plus, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ServiceSelectionModal } from './ServiceSelectionModal';


const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/discover', icon: Compass, label: 'Discover' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  const handleServiceSelect = (service: string, selectionType: 'quote' | 'supplier', serviceType?: string) => {
    setIsServiceModalOpen(false);
    
    if (service === 'moving') {
      navigate(`/moving?type=${selectionType}`);
    } else if (service === 'disposal') {
      navigate(`/disposal?serviceType=${serviceType}&type=${selectionType}`);
    } else if (service === 'transport') {
      navigate(`/transport?serviceType=${serviceType}&type=${selectionType}`);
    }
  };

  return (
    <>
      <nav 
        className="bottom-nav"
        role="navigation" 
        aria-label="Bottom navigation"
      >
        <div className="flex items-center justify-around h-20 px-4 pb-2 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <div key={item.path} className="relative">
                <Link
                  to={item.path}
                  className={cn(
                    'bottom-nav-item flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                    active
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              </div>
            );
          })}
        </div>
        
        {/* Floating Action Button */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <button
            className="w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            aria-label="Select service"
            onClick={() => setIsServiceModalOpen(true)}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <ServiceSelectionModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onServiceSelect={handleServiceSelect}
      />
    </>
  );
};

export default BottomNavigation;
