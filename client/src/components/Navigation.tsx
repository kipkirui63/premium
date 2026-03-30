
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
      <nav className="fixed top-0 z-50 w-full border-b border-sky-100 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/marketplace" className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/4db0eac4-a39c-4fac-9775-eed8e9a4bebb.png" 
                alt="CrispAI" 
                className="h-8 w-auto"
              />
            </Link>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/marketplace"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-sky-50 hover:text-sky-600"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Marketplace</span>
              </Link>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-sky-50 hover:text-sky-600"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button 
                    onClick={() => logout({ redirectTo: '/marketplace' })}
                    className="flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:border-sky-200 hover:text-sky-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-colors duration-200 hover:bg-sky-600"
                >
                  Sign In
                </button>
              )}
            </div>

            <div className="md:hidden">
              {user ? (
                <button 
                  onClick={() => logout({ redirectTo: '/marketplace' })}
                  className="rounded-full border border-sky-100 bg-white p-2 text-slate-600"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="rounded-full border border-sky-100 bg-white p-2 text-slate-600"
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
