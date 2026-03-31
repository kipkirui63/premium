
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
    <div className="mb-8 flex flex-col gap-5 rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.84))] p-4 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.3)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-[linear-gradient(135deg,#0ea5e9_0%,#38bdf8_55%,#7dd3fc_100%)] text-white shadow-[0_16px_35px_-18px_rgba(14,165,233,0.6)]'
                : 'bg-white text-slate-600 ring-1 ring-slate-200/80 hover:-translate-y-0.5 hover:bg-sky-50 hover:text-sky-700'
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
            className="w-full rounded-full border border-slate-200/80 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-600"
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
            className="rounded-full border border-slate-200/80 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFilters;
