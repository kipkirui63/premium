import React from 'react';

const MarketplaceFooter = () => {
  return (
    <footer className="bg-blue-600 text-white py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Section - Branding */}
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-3xl font-bold mb-3">CrispAI</h2>
            <p className="text-blue-100 text-lg">The AI Solutions Company</p>
            <div className="pt-4">
              <p className="text-blue-100 text-sm">info@crispai.ca</p>
            </div>
          </div>

          {/* Middle Section - Separated by vertical lines */}
          <div className="flex justify-center">
            <div className="h-full border-l border-r border-blue-400 px-12 space-y-6">
              <div className="text-center">
                <p className="text-blue-100 text-lg mb-2">CrispAI</p>
                <p className="text-blue-200 text-base">© 2025
 | All Rights Reserved</p>
              </div>
            </div>
          </div>

          {/* Right Section - Acknowledgement */}
          <div className="text-center md:text-right flex items-center">
            <div className="text-blue-100 text-base max-w-md mx-auto md:mx-0 leading-relaxed">
              <p>
                CrispAI acknowledges that the technology we develop operates globally, 
                connecting diverse communities and cultures. We honor and respect the 
                innovative spirit of all peoples and territories where our solutions 
                are deployed.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Spacer */}
        <div className="mt-16 pt-8 border-t border-blue-400 text-center">
          <p className="text-blue-200 text-sm">
            © 2025 CrispAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MarketplaceFooter;