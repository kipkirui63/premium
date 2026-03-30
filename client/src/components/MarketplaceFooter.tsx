import React from 'react';

const MarketplaceFooter = () => {
  return (
    <footer className="mt-12 bg-[linear-gradient(135deg,#0ea5e9_0%,#38bdf8_50%,#7dd3fc_100%)] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr_1fr]">
          <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5 text-center backdrop-blur md:text-left">
            <h2 className="mb-2 text-2xl font-bold">CrispAI</h2>
            <p className="text-base text-sky-50">The AI Solutions Company</p>
            <div className="pt-3">
              <p className="text-sm text-sky-50">info@crispai.ca</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5 text-center backdrop-blur">
            <div className="space-y-2">
              <p className="text-base text-sky-50">CrispAI</p>
              <p className="text-base text-sky-100">© 2025
 | All Rights Reserved</p>
            </div>
          </div>

          <div className="flex items-center rounded-[1.5rem] border border-white/20 bg-white/10 p-5 text-center backdrop-blur md:text-right">
            <div className="mx-auto max-w-md text-sm leading-6 text-sky-50 md:mx-0">
              <p>
                CrispAI acknowledges that the technology we develop operates globally, 
                connecting diverse communities and cultures. We honor and respect the 
                innovative spirit of all peoples and territories where our solutions 
                are deployed.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/20 pt-5 text-center">
          <p className="text-sm text-sky-100">
            © 2025 CrispAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MarketplaceFooter;
