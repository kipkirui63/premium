
import React from 'react';
import Navigation from '../components/Navigation';
import MarketplaceHero from '../components/MarketplaceHero';
import MarketplaceContent from '../components/MarketplaceContent';
import MarketplaceFooter from '../components/MarketplaceFooter';
import Seo from '../components/Seo';

const Marketplace = () => {
  const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://marketplace.crispai.ca').replace(/\/$/, '');

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f0f9ff_0%,#e0f2fe_38%,#f8fcff_100%)]">
      <Seo
        title="AI Tools Marketplace"
        description="Discover and buy CrispAI applications, AI agents, and workflow tools for analytics, writing, recruitment, and business operations."
        canonicalPath="/marketplace"
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "CrispAI",
            url: siteUrl,
          },
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "CrispAI Marketplace",
            description:
              "Discover and buy CrispAI applications, AI agents, and workflow tools for analytics, writing, recruitment, and business operations.",
            url: `${siteUrl}/marketplace`,
          },
        ]}
      />
      <Navigation />
      <MarketplaceHero />
      <MarketplaceContent />
      <MarketplaceFooter />
    </div>
  );
};

export default Marketplace;
