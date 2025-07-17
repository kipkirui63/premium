
import React, { useState } from 'react';
import { ShoppingCart, LogOut, User } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './auth/LoginModal';

const Navigation = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="w-full bg-white/90 backdrop-blur-sm border-b border-gray-200/50 fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/marketplace" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/4db0eac4-a39c-4fac-9775-eed8e9a4bebb.png" 
                alt="CrispAI" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-900"></span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/marketplace"
                className="text-gray-600 hover:text-blue-500 transition-colors duration-200 font-medium flex items-center space-x-1"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Marketplace</span>
              </Link>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button 
                    onClick={logout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-gray-600 hover:text-blue-500 transition-colors duration-200 font-medium"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              {user ? (
                <button 
                  onClick={logout}
                  className="text-gray-600 hover:text-blue-500"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-gray-600 hover:text-blue-500"
                >
                  <User className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Navigation;
