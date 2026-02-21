
import React, { useState } from 'react';
import MarketplaceFilters from './marketplace/MarketplaceFilters';
import AppsGrid from './marketplace/AppsGrid';
import CartSidebar from './CartSidebar';
import LoginModal from './auth/LoginModal';
import SubscriptionWarning from './SubscriptionWarning';
import PricingPlans from './PricingPlans';
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
      <div className="min-h-screen bg-gray-50 pt-16" data-marketplace-content>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SubscriptionWarning />
          
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
        onClose={() => setIsLoginModalOpen(false)}
      />


    </>
  );
};

export default MarketplaceContent;
