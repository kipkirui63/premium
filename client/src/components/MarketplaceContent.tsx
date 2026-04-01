import React, { useEffect, useState } from 'react';
import MarketplaceFilters from './marketplace/MarketplaceFilters';
import AppsGrid from './marketplace/AppsGrid';
import CartSidebar from './CartSidebar';
import LoginModal from './auth/LoginModal';
import SubscriptionWarning from './SubscriptionWarning';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { apiRequest } from '../lib/api';
import { TOOLS, Tool } from '../data/tools';

interface App extends Tool {
  selectedPlan?: 'monthly' | 'yearly';
}

type ModalAuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

const MarketplaceContent = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [allApps, setAllApps] = useState<App[]>(TOOLS);
  const [cartItems, setCartItems] = useState<App[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<ModalAuthMode>('login');
  const [resetUid, setResetUid] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [userRatings, setUserRatings] = useState<{ [key: number]: number }>({});

  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authMode = params.get('auth');
    const reason = params.get('reason');
    const reasonMessages: Record<string, { message: string; type: 'error' | 'success' | 'info' }> = {
      'session-expired': {
        message: 'Your session has expired. Please sign in again.',
        type: 'error',
      },
      'password-updated': {
        message: 'Password changed successfully. Please sign in with your new password.',
        type: 'success',
      },
      'session-required': {
        message: 'Please sign in to continue.',
        type: 'info',
      },
    };

    if (authMode === 'login' || authMode === 'forgot-password') {
      setAuthModalMode(authMode);
      setResetUid('');
      setResetToken('');
      setIsLoginModalOpen(true);
    }

    if (authMode === 'reset-password') {
      setAuthModalMode('reset-password');
      setResetUid(params.get('uid') || '');
      setResetToken(params.get('token') || '');
      setIsLoginModalOpen(true);
    }

    if (reason && reasonMessages[reason]) {
      const { message, type } = reasonMessages[reason];
      if (type === 'error') {
        toast.error(message);
      } else if (type === 'success') {
        toast.success(message);
      } else {
        toast.info(message);
      }
      params.delete('reason');
      const nextQuery = params.toString();
      window.history.replaceState(
        {},
        document.title,
        `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`,
      );
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadTools = async () => {
      try {
        const data = await apiRequest<Array<{
          id: number;
          name: string;
          description: string;
          monthly_price: string | number;
          yearly_price: string | number;
          free_trial_days: number;
          rating: string | number;
          review_count: number;
          badge: string;
          badge_color: string;
          icon: string;
          background_gradient: string;
          agent_url?: string;
          is_coming_soon?: boolean;
        }>>('/tools/', {
          suppressAuthRedirect: true,
        });

        if (!active) {
          return;
        }

        if (!Array.isArray(data) || data.length === 0) {
          setAllApps(TOOLS);
          return;
        }

        setAllApps(
          data.map((tool) => ({
            id: tool.id,
            name: tool.name,
            description: tool.description,
            monthlyPrice: Number(tool.monthly_price),
            yearlyPrice: Number(tool.yearly_price),
            freeTrialDays: `${tool.free_trial_days}-day free trial`,
            rating: Number(tool.rating),
            reviewCount: tool.review_count,
            badge: tool.badge,
            badgeColor: tool.badge_color,
            icon: tool.icon,
            backgroundGradient: tool.background_gradient,
            agentUrl: tool.agent_url,
            isComingSoon: Boolean(tool.is_coming_soon),
            actionType: TOOLS.find((item) => item.name === tool.name)?.actionType,
          })),
        );
      } catch {
        if (!active) {
          return;
        }
        setAllApps(TOOLS);
      }
    };

    loadTools();

    return () => {
      active = false;
    };
  }, []);

  const tabs = ['All', 'Analytics', 'Writing', 'Recruitment', 'Business'];

  const filteredApps = activeTab === 'All' 
    ? allApps 
    : allApps.filter(app => {
        const categoryMap: { [key: string]: string[] } = {
          'Analytics': ['Business Intelligence Agent'],
          'Writing': ['CrispWrite'],
          'Recruitment': ['AI Recruitment Assistant', 'Resume Analyzer'],
          'Business': ['SOP Assistant', 'AI Twin Agent', 'Email Scrapper', 'CustomGPTs']
        };
        return categoryMap[activeTab]?.includes(app.name);
      });

 const addToCart = (item: App, planType?: 'monthly' | 'yearly') => {
  // Check if user is logged in
  if (!user) {
    setAuthModalMode('login');
    setIsLoginModalOpen(true);
    toast.info('Please log in to add items to your cart');
    return;
  }

  setCartItems(prev => {
    const exists = prev.find(cartItem => cartItem.id === item.id);
    if (exists) {
      toast.info(`${item.name} is already in the cart.`);
      return prev;
    }
    
    // Add plan type to the item
    const itemWithPlan = { ...item, selectedPlan: planType || 'monthly' };
    toast.success(`${item.name} (${planType || 'monthly'}) added to cart successfully!`);
    return [...prev, itemWithPlan];
  });
};


  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setCartItems([]);
  };

  const handleRate = (appId: number, rating: number) => {
    console.log(`Rating app ${appId} with ${rating} stars`);
    setUserRatings(prev => ({
      ...prev,
      [appId]: rating
    }));
  };



  return (
    <>
      <div className="min-h-screen bg-transparent pt-10" data-marketplace-content>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SubscriptionWarning />

          <div className="rounded-[2.5rem] border border-white/80 bg-white/68 p-4 shadow-[0_40px_110px_-55px_rgba(15,23,42,0.22)] backdrop-blur-2xl md:p-6">
            <MarketplaceFilters
              activeTab={activeTab}
              tabs={tabs}
              cartItemCount={cartItems.length}
              onTabChange={setActiveTab}
              onCartClick={() => setIsCartOpen(true)}
              onSignInClick={() => {
                setAuthModalMode('login');
                setIsLoginModalOpen(true);
              }}
            />

            <AppsGrid
              apps={filteredApps}
              userRatings={userRatings}
              onAddToCart={addToCart}
              onRate={handleRate}
            />
          </div>
        </div>
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onOpenLoginModal={() => {
          setAuthModalMode('login');
          setIsLoginModalOpen(true);
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        initialMode={authModalMode}
        resetUid={resetUid}
        resetToken={resetToken}
        onClose={() => {
          setIsLoginModalOpen(false);
          const params = new URLSearchParams(window.location.search);
          if (['login', 'forgot-password', 'reset-password'].includes(params.get('auth') || '')) {
            params.delete('auth');
            params.delete('reason');
            params.delete('uid');
            params.delete('token');
            const nextQuery = params.toString();
            window.history.replaceState(
              {},
              document.title,
              `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`,
            );
          }
        }}
      />


    </>
  );
};

export default MarketplaceContent;
