
import React, { useState } from 'react';
import MarketplaceFilters from './marketplace/MarketplaceFilters';
import AppsGrid from './marketplace/AppsGrid';
import CartSidebar from './CartSidebar';
import LoginModal from './auth/LoginModal';
import SubscriptionWarning from './SubscriptionWarning';
import PricingPlans from './PricingPlans';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';


interface App {
  id: number;
  name: string;
  description: string;
  price: string;
  freeTrialDays: string;
  rating: number;
  reviewCount: number;
  badge: string;
  badgeColor: string;
  icon: string;
  backgroundGradient: string;
  agentUrl?: string;
  isComingSoon?: boolean;
}

const MarketplaceContent = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [cartItems, setCartItems] = useState<App[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [userRatings, setUserRatings] = useState<{ [key: number]: number }>({});
  const [selectedPlan, setSelectedPlan] = useState<{type: 'monthly' | 'yearly', price: number} | null>(null);
  const { user } = useAuth();

  const tabs = ['All', 'Analytics', 'Writing', 'Recruitment', 'Business'];

  // Updated apps data with correct URLs and CrispWrite reviews set to 0
  const allApps: App[] = [
    {
      id: 1,
      name: 'Business Intelligence Agent',
      description: 'Advanced AI-powered analytics platform that transforms your data into actionable insights with real-time dashboards and predictive modeling.',
      price: '$19.99',
      freeTrialDays: '7-day free trial',
      rating: 4.6,
      reviewCount: 176,
      badge: 'Popular',
      badgeColor: 'bg-blue-500',
      icon: '/lovable-uploads/db8496d5-abfd-475d-acfa-4ec1a30bb1e6.png',
      backgroundGradient: 'bg-gradient-to-br from-blue-400 to-purple-600',
      agentUrl: 'https://businessagent.crispai.ca/'
    },
    {
      id: 2,
      name: 'AI Recruitment Assistant',
      description: 'Streamline your hiring process with AI-powered candidate screening, interview scheduling, and talent matching algorithms.',
      price: '$19.99',
      freeTrialDays: '7-day free trial',
      rating: 4,
      reviewCount: 146,
      badge: 'New',
      badgeColor: 'bg-green-500',
      icon: '/lovable-uploads/4d97bc8a-c3f5-40eb-807d-b6745199d8dd.png',
      backgroundGradient: 'bg-gradient-to-br from-green-400 to-blue-500',
      agentUrl: 'https://workflow.getmindpal.com/67751ba8f77a6fddb63cd44e'
    },
    {
      id: 3,
      name: 'CrispWrite',
      description: 'Professional writing assistant that helps create compelling content, from emails to reports, with AI-powered grammar and style suggestions.',
      price: '$89.99',
      freeTrialDays: '7-day free trial',
      rating: 5,
      reviewCount: 170,
      badge: 'Trending',
      badgeColor: 'bg-gray-500',
      icon: '/lovable-uploads/d66f2274-4cd1-4479-83ff-ae819baf5942.png',
      backgroundGradient: 'bg-gradient-to-br from-orange-400 to-red-500',
      agentUrl:"https://crispwrite.crispai.ca/"
      
    },
    {
      id: 4,
      name: 'SOP Assistant',
      description: 'Create, manage, and optimize Standard Operating Procedures with intelligent templates and collaborative editing features.',
      price: '$19.99',
      freeTrialDays: '7-day free trial',
      rating: 4.5,
      reviewCount: 145,
      badge: 'Trending',
      badgeColor: 'bg-purple-500',
      icon: '/lovable-uploads/e3d9814f-4b52-429f-8456-40b09db8f73a.png',
      backgroundGradient: 'bg-gradient-to-br from-purple-400 to-pink-500',
      agentUrl: 'https://workflow.getmindpal.com/sop-agent-workflow-avlkgrhad7x0xazm'
    },
    {
      id: 5,
      name: 'Resume Analyzer',
      description: 'Advanced resume screening tool that evaluates candidates against job requirements with detailed scoring and recommendations.',
      price: '$19.99',
      freeTrialDays: '7-day free trial',
      rating: 120,
      reviewCount: 180,
      badge: 'Essential',
      badgeColor: 'bg-indigo-500',
      icon: '/lovable-uploads/ee996b90-5709-4ed0-a535-014aa0accf98.png',
      backgroundGradient: 'bg-gradient-to-br from-indigo-400 to-blue-600',
      agentUrl: 'https://workflow.getmindpal.com/67751e695156e8aaefc0c8de'
    }
  ];

  const filteredApps = activeTab === 'All' 
    ? allApps 
    : allApps.filter(app => {
        const categoryMap: { [key: string]: string[] } = {
          'Analytics': ['Business Intelligence Agent'],
          'Writing': ['CrispWrite'],
          'Recruitment': ['AI Recruitment Assistant', 'Resume Analyzer'],
          'Business': ['SOP Assistant']
        };
        return categoryMap[activeTab]?.includes(app.name);
      });

 const addToCart = (item: App) => {
  // Check if user is logged in
  if (!user) {
    setIsLoginModalOpen(true);
    toast.info('Please log in to add items to your cart');
    return;
  }

  // Check if user has selected a plan
  if (!selectedPlan) {
    toast.info('Please select a subscription plan first');
    return;
  }

  setCartItems(prev => {
    const exists = prev.find(cartItem => cartItem.id === item.id);
    if (exists) {
      toast.info(`${item.name} is already in the cart.`);
      return prev;
    }
    toast.success(`${item.name} added to cart successfully!`);
    return [...prev, item];
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

  const handlePlanSelect = (plan: 'monthly' | 'yearly', price: number) => {
    setSelectedPlan({ type: plan, price });
    setIsPricingModalOpen(false);
    // After selecting a plan, users can now add items to cart
    toast.success(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan selected - $${price}. You can now add items to your cart!`);
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
          
          {/* Pricing Plans Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <PricingPlans onSelectPlan={handlePlanSelect} />
          </div>
          
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
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Pricing Modal */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Choose Your Subscription Plan</h2>
              <button
                onClick={() => setIsPricingModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <PricingPlans onSelectPlan={handlePlanSelect} />
          </div>
        </div>
      )}
    </>
  );
};

export default MarketplaceContent;
