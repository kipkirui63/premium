
import React from 'react';
import Navigation from '../components/Navigation';
import MarketplaceHero from '../components/MarketplaceHero';
import MarketplaceContent from '../components/MarketplaceContent';
import MarketplaceFooter from '../components/MarketplaceFooter';

const Marketplace = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <MarketplaceHero />
      <MarketplaceContent />
      <MarketplaceFooter />
    </div>
  );
};

export default Marketplace;
