
import React from 'react';
import { Search, ShoppingCart } from 'lucide-react';

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
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'bg-sky-50 text-slate-600 hover:bg-sky-100 hover:text-sky-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:w-80">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search applications..."
            className="w-full rounded-full border border-sky-100 bg-sky-50/80 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-sky-100 bg-white text-slate-600 transition-colors hover:border-sky-200 hover:text-sky-600"
            onClick={onCartClick}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
                {cartItemCount}
              </span>
            )}
          </button>
          <button 
            onClick={onSignInClick}
            className="rounded-full border border-sky-100 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-sky-200 hover:text-sky-600"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFilters;
