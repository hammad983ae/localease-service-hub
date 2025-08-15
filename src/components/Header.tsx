
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  Building2,
  Sparkles
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/bookings', label: 'Bookings', icon: Calendar },
    { path: '/chats', label: 'Chats', icon: MessageCircle },
    { path: '/quotes', label: 'Quotes', icon: FileText },
    { path: '/support', label: 'Support', icon: HelpCircle },
  ];

  const isHomePage = location.pathname === '/home';

  return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-modern">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-beautiful group-hover:scale-105 transition-all duration-300">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gradient">LocalEase</h1>
                  <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                    SaaS
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Professional Service Hub</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                    location.pathname === item.path 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Search Bar - Only on Home */}
            {isHomePage && (
              <div className="hidden xl:flex items-center flex-1 max-w-sm mx-6">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    className="pl-10 h-10 rounded-xl border-border/50 bg-muted/50 backdrop-blur focus:bg-background transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-xl hover:bg-accent transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold min-w-[20px]"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-accent transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">{user?.name || 'User'}</span>
                </Button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 rounded-xl border border-border/50 bg-background/95 backdrop-blur shadow-2xl z-50 animate-scale-in">
                    <div className="p-6 space-y-6">
                      {/* User Info */}
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                            {user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{user?.name || 'User'}</p>
                          <p className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {user?.role || 'Standard'} User
                          </Badge>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/80 transition-all duration-200 group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                          <span className="font-medium">Profile Settings</span>
                        </Link>
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/80 transition-all duration-200 group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="pt-4 border-t border-border/50">
                        <button
                          onClick={() => {
                            signOut();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive w-full transition-all duration-200 group font-medium"
                        >
                          <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-10 w-10 rounded-xl hover:bg-accent"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-border/50 py-4 bg-muted/30 backdrop-blur animate-fade-in">
              <nav className="flex flex-col gap-1 px-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      location.pathname === item.path 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setIsMenuOpen(false)}
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
