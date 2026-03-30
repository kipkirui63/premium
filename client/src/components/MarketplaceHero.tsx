import React from 'react';

const MarketplaceHero = () => {
  const scrollToMarketplace = () => {
    const marketplaceSection = document.querySelector('[data-marketplace-content]');
    if (marketplaceSection) {
      marketplaceSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-sky-100 bg-[linear-gradient(135deg,#e0f2fe_0%,#f0f9ff_45%,#ffffff_100%)] pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_30%)]" />
      <div className="absolute left-0 top-24 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" />
      <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex rounded-full border border-sky-100 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
            <img
              src="/lovable-uploads/4db0eac4-a39c-4fac-9775-eed8e9a4bebb.png"
              alt="CrispAI"
              className="h-7 w-auto"
            />
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/80 bg-white/70 p-8 shadow-[0_30px_80px_-45px_rgba(14,165,233,0.45)] backdrop-blur">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.04em] text-slate-900 md:text-6xl">
              Find the Perfect<br />
              Digital Tools
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 md:text-xl">
              Discover and purchase powerful<br />
              applications and AI agents to enhance<br />
              your workflow
            </p>
            <button
              onClick={scrollToMarketplace}
              className="mt-8 rounded-full bg-sky-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-600"
            >
              Browse Marketplace
            </button>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-0 rounded-[2.5rem] bg-sky-300/20 blur-3xl" />
          <div className="relative grid grid-cols-2 gap-5 rounded-[2.5rem] border border-white/80 bg-white/55 p-6 shadow-[0_30px_90px_-50px_rgba(2,132,199,0.45)] backdrop-blur">
            <div className="overflow-hidden rounded-[1.75rem] bg-sky-100 shadow-md">
              <img
                src="/lovable-uploads/db8496d5-abfd-475d-acfa-4ec1a30bb1e6.png"
                alt="Business Intelligence Agent"
                className="h-48 w-full object-cover"
              />
            </div>
            <div className="mt-10 overflow-hidden rounded-[1.75rem] bg-sky-100 shadow-md">
              <img
                src="/lovable-uploads/4d97bc8a-c3f5-40eb-807d-b6745199d8dd.png"
                alt="AI Recruitment Assistant"
                className="h-56 w-full object-cover"
              />
            </div>
            <div className="-mt-10 overflow-hidden rounded-[1.75rem] bg-sky-100 shadow-md">
              <img
                src="/lovable-uploads/d66f2274-4cd1-4479-83ff-ae819baf5942.png"
                alt="CrispWrite"
                className="h-56 w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-[1.75rem] bg-sky-100 shadow-md">
              <img
                src="/lovable-uploads/e3d9814f-4b52-429f-8456-40b09db8f73a.png"
                alt="SOP Assistant"
                className="h-48 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceHero;
