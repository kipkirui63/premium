import React, { useEffect, useState } from 'react';

const MarketplaceHero = () => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const backgroundImages = [
    'https://images.unsplash.com/photo-1648737966636-2fc3a5fffc8a?w=1800&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxzZWFyY2h8MTV8fHRlY2hub2xvZ3l8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1760276888172-f123e959d4f2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    'https://plus.unsplash.com/premium_photo-1683121710572-7723bd2e235d?w=1800&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fHRlY2hub2xvZ3l8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjJ8fHRlY2hub2xvZ3l8ZW58MHx8MHx8fDA%3D'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change background every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const scrollToMarketplace = () => {
    const marketplaceSection = document.querySelector('[data-marketplace-content]');
    if (marketplaceSection) {
      marketplaceSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-blue-500 pt-16 relative overflow-hidden h-[600px]">
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>
      
      {/* Background image carousel */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentBgIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
              backgroundImage: `url(${image})`,
              backgroundPosition: 'center center'
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 h-full relative z-10 flex items-center">
        <div className="flex items-center justify-between w-full">
          {/* Left text content */}
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find the Perfect<br />
              Digital Tools
            </h1>
            <p className="text-xl mb-8">
              Discover and purchase powerful<br />
              applications and AI agents to enhance<br />
              your workflow
            </p>
            <button 
              onClick={scrollToMarketplace}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg"
            >
              Browse Marketplace
            </button>
          </div>

          {/* Right image container */}
          <div className="hidden lg:block">
            {/* <div className="w-80 h-80 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <img 
                src="/lovable-uploads/4db0eac4-a39c-4fac-9775-eed8e9a4bebb.png" 
                alt="CrispAI" 
                className="h-32 w-auto"
              />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHero;