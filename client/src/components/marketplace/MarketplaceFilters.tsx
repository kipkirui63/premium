
import React from 'react';
import { Search, ShoppingCart, Home } from 'lucide-react';

interface MarketplaceFiltersProps {
  activeTab: string;
  tabs: string[];
  cartItemCount: number;
  onTabChange: (tab: string) => void;
  onCartClick: () => void;
  onSignInClick: () => void;
}

const MarketplaceFilters = ({ 
  activeTab, 
  tabs, 
  cartItemCount, 
  onTabChange, 
  onCartClick,
  onSignInClick
}: MarketplaceFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search applications..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
          />
        </div>
        <div className="flex items-center space-x-4">
          {/* <button className="p-2 text-gray-600 hover:text-blue-500">
            <Home className="w-5 h-5" />
          </button> */}
          <button 
            className="relative p-2 text-gray-600 hover:text-blue-500"
            onClick={onCartClick}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
          <button 
            onClick={onSignInClick}
            className="text-gray-600 hover:text-blue-500 font-medium"
          >
            
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFilters;
