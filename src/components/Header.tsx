
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings,
  LogOut,
  Home,
  Calendar,
  MessageCircle,
  FileText,
  HelpCircle,
  ShoppingCart
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiServiceCart } from '@/contexts/MultiServiceCartContext';
import LanguageToggle from '@/components/LanguageToggle';
import { RecentChatsPopup } from '@/components/RecentChatsPopup';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isChatsPopupOpen, setIsChatsPopupOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { user, signOut } = useAuth();
  const { state, openCart } = useMultiServiceCart();
  const location = useLocation();
  const navigate = useNavigate();
  const popupRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/bookings', label: 'Bookings', icon: Calendar },
    { path: '/quotes', label: 'Quotes', icon: FileText },
    { path: '/support', label: 'Support', icon: HelpCircle },
  ];



  // Handle click outside popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsChatsPopupOpen(false);
      }
    };

    if (isChatsPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatsPopupOpen]);

  const handleChatsPopupClose = () => {
    setIsChatsPopupOpen(false);
  };

  const handleShowAllChats = () => {
    navigate('/chats');
    setIsChatsPopupOpen(false);
  };

  return (
      <header className="saas-header">
        <div className="container-modern">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-beautiful group-hover:scale-105 transition-transform">L</div>
              <div className="hidden sm:block">
                <h1 className="text-base font-semibold text-gradient">LocalEase</h1>
                <p className="text-xs text-muted-foreground">Service Hub</p>
              </div>
            </Link>

            {/* Hamburger Menu - All Devices */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-xl hover:bg-accent"
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search Bar - All Pages */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-10 h-10 rounded-xl input-modern shadow-none"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1">
              {/* Language Toggle */}
              <LanguageToggle />

              {/* Chat Icon */}
              <div className="relative" ref={popupRef}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 rounded-xl hover:bg-accent"
                  onClick={() => setIsChatsPopupOpen(!isChatsPopupOpen)}
                >
                  <MessageCircle className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>
                
                <RecentChatsPopup
                  isOpen={isChatsPopupOpen}
                  onClose={handleChatsPopupClose}
                  onShowAllChats={handleShowAllChats}
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="p-2 rounded-xl hover:bg-accent">
                <Bell className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 rounded-xl hover:bg-accent"
                  onClick={openCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {state.totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                      {state.totalItems > 99 ? '99+' : state.totalItems}
                    </span>
                  )}
                </Button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-xl hover:bg-accent"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <User className="h-5 w-5" />
                </Button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 saas-card-glass z-50 animate-scale-in">
                    <div className="p-4 space-y-4">
                      {/* User Info */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-white font-semibold">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold">{user?.name || 'User'}</p>
                          <p className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</p>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                        {user?.role === 'admin' && (
                          <>
                            <Link
                              to="/admin"
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Settings className="h-4 w-4" />
                              <span>Settings</span>
                            </Link>
                            <Link
                              to="/admin"
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <FileText className="h-4 w-4" />
                              <span>Dashboard</span>
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="pt-2 border-t border-border/50">
                        <button
                          onClick={() => {
                            signOut();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive w-full transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Dropdown - Triggered by Hamburger */}
          {isNavOpen && (
            <div className="border-t border-border/50 py-4 animate-fade-in">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "nav-item",
                      location.pathname === item.path && "active"
                    )}
                    onClick={() => setIsNavOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>
  );
};

export default Header;
