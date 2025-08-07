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
  X
} from 'lucide-react';

const Navigation = () => {
  const { userProfile, signOut, isAdmin, isMemberOrAbove } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { 
      path: '/', 
      label: 'Feed', 
      icon: Home,
      roles: ['Member', 'Leader', 'Admin']
    },
    { 
      path: '/docs', 
      label: 'Documents', 
      icon: FileText,
      roles: ['Member', 'Leader', 'Admin']
    },
    { 
      path: '/chat', 
      label: 'Chat', 
      icon: MessageCircle,
      roles: ['Member', 'Leader', 'Admin']
    },
    { 
      path: '/profile', 
      label: 'Profile', 
      icon: User,
      roles: ['Member', 'Leader', 'Admin']
    },
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: Settings,
      roles: ['Admin']
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userProfile?.role)
  );

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Leader': return 'bg-purple-100 text-purple-800';
      case 'Member': return 'bg-green-100 text-green-800';
      case 'Applicant': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              Haus of Basquiat
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.display_name || 'User'}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(userProfile?.role)}`}>
                    {userProfile?.role}
                  </span>
                  {userProfile?.house && (
                    <span className="text-xs text-gray-500">
                      {userProfile.house.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-gray-600" />
                )}
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2">
                  <p className="text-base font-medium text-gray-900">
                    {userProfile?.display_name || 'User'}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(userProfile?.role)}`}>
                      {userProfile?.role}
                    </span>
                    {userProfile?.house && (
                      <span className="text-xs text-gray-500">
                        {userProfile.house.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors w-full"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;