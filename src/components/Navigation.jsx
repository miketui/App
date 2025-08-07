import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  FileText, 
  MessageCircle, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Users,
  Shield,
  Award,
  ChevronDown,
  CreditCard,
  Calendar,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Navigation() {
  const { userProfile, logout, canAccess } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Feed',
      href: '/',
      icon: Home,
      roles: ['Applicant', 'Member', 'Leader', 'Admin']
    },
    {
      name: 'Documents',
      href: '/docs',
      icon: FileText,
      roles: ['Member', 'Leader', 'Admin']
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageCircle,
      roles: ['Member', 'Leader', 'Admin']
    },
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
      roles: ['Member', 'Leader', 'Admin']
    },
    {
      name: 'Subscriptions',
      href: '/subscriptions',
      icon: CreditCard,
      roles: ['Member', 'Leader', 'Admin']
    },
    {
      name: 'Admin',
      href: '/admin',
      icon: BarChart3,
      roles: ['Admin', 'Leader']
    }
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
  };

  const getRoleColor = (role) => {
    const colors = {
      'Applicant': 'bg-yellow-100 text-yellow-800',
      'Member': 'bg-blue-100 text-blue-800',
      'Leader': 'bg-purple-100 text-purple-800',
      'Admin': 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role) => {
    const icons = {
      'Applicant': Award,
      'Member': User,
      'Leader': Shield,
      'Admin': Shield
    };
    return icons[role] || User;
  };

  const RoleIcon = getRoleIcon(userProfile?.role);

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Haus of Basquiat</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              if (!item.roles.includes(userProfile?.role)) return null;
              
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - notifications and profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {userProfile?.display_name?.charAt(0) || userProfile?.first_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.display_name || userProfile?.first_name || 'User'}
                  </p>
                  <div className="flex items-center space-x-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(userProfile?.role)}`}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {userProfile?.role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {userProfile?.display_name || userProfile?.first_name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500">{userProfile?.email}</p>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(userProfile?.role)}`}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {userProfile?.role}
                          </span>
                        </div>
                      </div>
                      
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      
                      {canAccess('manage_users') && (
                        <Link
                          to="/admin/users"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Users className="w-4 h-4 mr-3" />
                          Manage Users
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                if (!item.roles.includes(userProfile?.role)) return null;
                
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.display_name || userProfile?.first_name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500">{userProfile?.email}</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(userProfile?.role)}`}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {userProfile?.role}
                    </span>
                  </div>
                </div>
                
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-base text-gray-700 hover:bg-gray-50"
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </Link>
                
                {canAccess('manage_users') && (
                  <Link
                    to="/admin/users"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-base text-gray-700 hover:bg-gray-50"
                  >
                    <Users className="w-5 h-5 mr-3" />
                    Manage Users
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navigation;