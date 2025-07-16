import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession } from '../services/checkoutService';
import { useToast } from '@/hooks/use-toast';

interface PricingPlansProps {
  onSelectPlan: (plan: 'monthly' | 'yearly', price: number) => void;
}

const PricingPlans = ({ onSelectPlan }: PricingPlansProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, checkTokenExpiry } = useAuth();
  const { toast } = useToast();

  const monthlyPrice = 19.99;
  const yearlyPrice = 199.99; // $16.66/month when billed annually
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice;
  const yearlySavingsPercentage = Math.round((yearlySavings / (monthlyPrice * 12)) * 100);

  const handlePlanSelect = async (plan: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
    const price = plan === 'monthly' ? monthlyPrice : yearlyPrice;
    
    // Check authentication and token expiry
    const token = localStorage.getItem('access_token');
    if (!user || !token || !checkTokenExpiry()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to proceed with checkout.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create checkout session with the plan type
      const toolName = plan === 'monthly' ? 'CrispAI Monthly' : 'CrispAI Yearly';
      const checkoutUrl = await createCheckoutSession(token, toolName);
      
      // Open Stripe checkout in a new tab
      window.open(checkoutUrl, '_blank');
      
      toast({
        title: "Redirecting to Checkout",
        description: `Opening checkout for ${plan} plan - $${price}`,
      });
      
      onSelectPlan(plan, price);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Select the plan that works best for you</p>
      </div>

      {/* Plan Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => handlePlanSelect('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              selectedPlan === 'monthly'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => handlePlanSelect('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              selectedPlan === 'yearly'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Monthly Plan */}
        <div className={`bg-white rounded-lg border-2 p-6 ${
          selectedPlan === 'monthly' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
        }`}>
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Monthly Plan</h3>
            <div className="text-3xl font-bold text-blue-600">
              ${monthlyPrice}
              <span className="text-sm font-normal text-gray-600">/month</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Billed monthly</p>
          </div>
          
          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span>Access to all AI tools</span>
            </li>
            <li className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span>7-day free trial</span>
            </li>
            <li className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span>Cancel anytime</span>
            </li>
          </ul>

          <Button 
            className={`w-full ${selectedPlan === 'monthly' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
            onClick={() => handlePlanSelect('monthly')}
            disabled={isProcessing}
          >
            {isProcessing && selectedPlan === 'monthly' ? 'Processing...' : selectedPlan === 'monthly' ? 'Selected' : 'Select Monthly'}
          </Button>
        </div>

        {/* Yearly Plan */}
        <div className={`bg-white rounded-lg border-2 p-6 relative ${
          selectedPlan === 'yearly' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
        }`}>
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
            Save {yearlySavingsPercentage}%
          </Badge>
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Yearly Plan</h3>
            <div className="text-3xl font-bold text-blue-600">
              ${yearlyPrice}
              <span className="text-sm font-normal text-gray-600">/year</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              ${(yearlyPrice / 12).toFixed(2)}/month billed annually
            </p>
            <p className="text-sm text-green-600 font-medium mt-1">
              Save ${yearlySavings.toFixed(2)} per year
            </p>
          </div>
          
          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span>Access to all AI tools</span>
            </li>
            <li className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span>7-day free trial</span>
            </li>
            <li className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span>Cancel anytime</span>
            </li>
            <li className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span>2 months free</span>
            </li>
          </ul>

          <Button 
            className={`w-full ${selectedPlan === 'yearly' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            variant={selectedPlan === 'yearly' ? 'default' : 'outline'}
            onClick={() => handlePlanSelect('yearly')}
            disabled={isProcessing}
          >
            {isProcessing && selectedPlan === 'yearly' ? 'Processing...' : selectedPlan === 'yearly' ? 'Selected' : 'Select Yearly'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;