
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
  monthlyPrice: number;
  yearlyPrice: number;
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

  const [userRatings, setUserRatings] = useState<{ [key: number]: number }>({});

  const { user } = useAuth();

  const tabs = ['All', 'Analytics', 'Writing', 'Recruitment', 'Business'];

  // Updated apps data with individual monthly/yearly pricing
  const allApps: App[] = [
    {
      id: 1,
      name: 'Business Intelligence Agent',
      description: 'Advanced AI-powered analytics platform that transforms your data into actionable insights with real-time dashboards and predictive modeling.',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
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
      monthlyPrice: 24.99,
      yearlyPrice: 249.99,
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
      monthlyPrice: 89.99,
      yearlyPrice: 899.99,
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
      monthlyPrice: 15.99,
      yearlyPrice: 159.99,
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
      monthlyPrice: 12.99,
      yearlyPrice: 129.99,
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
