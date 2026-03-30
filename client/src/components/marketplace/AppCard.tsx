import React from 'react';
import { Star, ShoppingCart, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

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
  actionType?: 'view' | 'cart';
}

interface AppCardProps {
  app: App;
  userRating: number;
  onAddToCart: (app: App, planType?: 'monthly' | 'yearly') => void;
  onRate: (appId: number, rating: number) => void;
}

const AppCard = ({ app, userRating, onAddToCart, onRate }: AppCardProps) => {
  const { user } = useAuth();
  const { hasPurchased, isLoading, checkSubscription } = useSubscription();
  
  // Add local state for plan selection within each card
  const [selectedPlan, setSelectedPlan] = React.useState<'monthly' | 'yearly'>('monthly');
  
  const hasAccessToApp = hasPurchased(app.name);
  
  // Calculate dynamic price based on selected plan
  const priceText = selectedPlan === 'yearly' ? 
    `$${app.yearlyPrice}/year` : 
    `$${app.monthlyPrice}/month`;
  
  const saveAmount = selectedPlan === 'yearly' ? 
    (app.monthlyPrice * 12) - app.yearlyPrice : 0;
  const savePercentage = selectedPlan === 'yearly' ? 
    Math.round((saveAmount / (app.monthlyPrice * 12)) * 100) : 0;
  
  const renderStars = (interactive: boolean = false) => {
  const stars = [];

  if (!interactive) {
    // Always show 4.5 stars for display
    for (let i = 1; i <= 5; i++) {
      if (i <= 4) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
          />
        );
      } else {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 text-yellow-400"
            style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)", fill: "#facc15" }}
          />
        );
      }
    }
  } else {
    // Allow interactive user rating
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= userRating;

      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 transition-colors ${
            isFilled
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 hover:text-yellow-400 cursor-pointer'
          }`}
          onClick={() => onRate(app.id, i)}
        />
      );
    }
  }

  return stars;
};


  const handleAgentClick = async () => {
    if (app.isComingSoon) {
      alert('This app is coming soon!');
      return;
    }

    if (!user) {
      alert('Please sign in to access the agent');
      return;
    }
    
    try {
      await checkSubscription();
      
      if (!hasPurchased(app.name)) {
        alert(`You need to purchase ${app.name} to access this agent.`);
        return;
      }
      
      if (app.agentUrl) {
        window.open(app.agentUrl, '_blank');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      alert('Error verifying your access. Please try again.');
    }
  };

  const getActionButton = () => {
    if (isLoading) {
      return (
        <button 
          disabled
          className="flex w-full items-center justify-center space-x-2 rounded-full bg-slate-300 px-4 py-3 font-medium text-white"
        >
          <span>Loading...</span>
        </button>
      );
    }

    if (app.isComingSoon) {
      return (
        <button 
          disabled
          className="flex w-full items-center justify-center space-x-2 rounded-full bg-slate-400 px-4 py-3 font-medium text-white"
        >
          <span>Coming Soon</span>
        </button>
      );
    }

    if (app.actionType === 'view') {
      return (
        <button
          onClick={() => {
            if (app.agentUrl) {
              window.open(app.agentUrl, '_blank');
            }
          }}
          className="flex w-full items-center justify-center space-x-2 rounded-full bg-sky-500 px-4 py-3 font-medium text-white transition-colors hover:bg-sky-600"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View</span>
        </button>
      );
    }

    if (!user) {
      return (
        <button 
          onClick={() => onAddToCart(app, selectedPlan)}
          className="flex w-full items-center justify-center space-x-2 rounded-full bg-sky-500 px-4 py-3 font-medium text-white transition-colors hover:bg-sky-600"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      );
    }

    if (hasAccessToApp) {
      return (
        <button 
          onClick={handleAgentClick}
          className="flex w-full items-center justify-center space-x-2 rounded-full bg-emerald-500 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Access App</span>
        </button>
      );
    }

    return (
      <button 
        onClick={() => onAddToCart(app, selectedPlan)}
        className="flex w-full items-center justify-center space-x-2 rounded-full bg-sky-500 px-4 py-3 font-medium text-white transition-colors hover:bg-sky-600"
      >
        <ShoppingCart className="w-4 h-4" />
        <span>Purchase</span>
      </button>
    );
  };

  const displayReviewCount = userRating > 0 ? app.reviewCount + 1 : app.reviewCount;

  return (
    <div className="group overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_24px_70px_-45px_rgba(14,165,233,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-40px_rgba(14,165,233,0.45)]">
      <div className={`relative flex h-64 items-center justify-center overflow-hidden ${app.backgroundGradient}`}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(15,23,42,0.18))]" />
        <div className={`absolute top-4 right-4 ${app.badgeColor} z-10 rounded-full px-3 py-1 text-xs font-bold text-white`}>
          {app.badge}
        </div>
        {user && hasAccessToApp && !app.isComingSoon && (
          <div className="absolute left-4 top-4 z-10 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
            Owned
          </div>
        )}
        <img src={app.icon} alt={app.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 
            className={`text-xl font-bold transition-colors ${
              app.agentUrl && !app.isComingSoon && (hasAccessToApp || app.actionType === 'view')
                ? 'flex cursor-pointer items-center gap-1 text-slate-900 hover:text-sky-600' 
                : 'text-slate-900'
            }`}
            onClick={
              app.agentUrl && !app.isComingSoon && (hasAccessToApp || app.actionType === 'view')
                ? app.actionType === 'view'
                  ? () => window.open(app.agentUrl, '_blank')
                  : handleAgentClick
                : undefined
            }
          >
            {app.name}
            {app.agentUrl && !app.isComingSoon && (hasAccessToApp || app.actionType === 'view') && (
              <ExternalLink className="w-4 h-4" />
            )}
          </h3>
          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-right">
            <div className="text-2xl font-bold text-sky-600">{priceText}</div>
            {selectedPlan === 'yearly' && saveAmount > 0 && (
              <div className="text-xs text-green-600 font-medium">
                Save {savePercentage}% (${saveAmount.toFixed(0)})
              </div>
            )}
            <div className="text-sm text-green-600">{app.freeTrialDays}</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex rounded-full bg-sky-50 p-1">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                selectedPlan === 'monthly'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                selectedPlan === 'yearly'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
        
        <p className="mb-5 text-sm leading-7 text-slate-600">{app.description}</p>
        
        <div className="mb-5 flex items-center space-x-2">
          <div className="flex">
            {renderStars(false)}
          </div>
          <span className="text-sm text-slate-500">({displayReviewCount})</span>
        </div>
        
        {getActionButton()}
      </div>
    </div>
  );
};

export default AppCard;
