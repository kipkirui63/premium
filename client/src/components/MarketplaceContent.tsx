import React, { useEffect, useState } from 'react';
import MarketplaceFilters from './marketplace/MarketplaceFilters';
import AppsGrid from './marketplace/AppsGrid';
import CartSidebar from './CartSidebar';
import LoginModal from './auth/LoginModal';
import SubscriptionWarning from './SubscriptionWarning';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { TOOLS, Tool } from '../data/tools';

interface App extends Tool {
  selectedPlan?: 'monthly' | 'yearly';
}

const MarketplaceContent = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [cartItems, setCartItems] = useState<App[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

    if (authMode === 'login') {
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

  const tabs = ['All', 'Analytics', 'Writing', 'Recruitment', 'Business'];

  // Use static tools data from the data file
  const allApps: App[] = TOOLS;

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

          <div className="rounded-[2rem] border border-white/80 bg-white/65 p-4 shadow-[0_30px_80px_-50px_rgba(14,165,233,0.35)] backdrop-blur md:p-6">
            <MarketplaceFilters
              activeTab={activeTab}
              tabs={tabs}
              cartItemCount={cartItems.length}
              onTabChange={setActiveTab}
              onCartClick={() => setIsCartOpen(true)}
              onSignInClick={() => setIsLoginModalOpen(true)}
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
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          const params = new URLSearchParams(window.location.search);
          if (params.get('auth') === 'login') {
            params.delete('auth');
            params.delete('reason');
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
