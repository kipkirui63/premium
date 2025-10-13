
import React, { useState } from 'react';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { createCheckoutSession } from '../services/checkoutService';
import { useToast } from '@/hooks/use-toast';

interface App {
  id: number;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: string;
  isComingSoon?: boolean;
  selectedPlan?: 'monthly' | 'yearly';
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: App[];
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onOpenLoginModal?: () => void;
}

const CartSidebar = ({ isOpen, onClose, cartItems, onRemoveItem, onClearCart, onOpenLoginModal }: CartSidebarProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
   const { user, checkTokenExpiry } = useAuth();
    const token = localStorage.getItem('access_token');
  const { hasPurchased, checkSubscription } = useSubscription();
  const { toast } = useToast();

  const handleProceedToCheckout = async () => {
    console.log('Checkout clicked - User:', !!user, 'Token:', !!token);

    if (!user || !token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to proceed with checkout.",
        variant: "destructive",
      });
      onOpenLoginModal?.();
      return;
    }

    // Check if token is expired
    if (!checkTokenExpiry()) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      });
      onOpenLoginModal?.();
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    // Filter out coming soon items and already purchased items
    const availableItems = cartItems.filter(item => !item.isComingSoon && !hasPurchased(item.name));
    
    if (availableItems.length === 0) {
      toast({
        title: "No Available Items",
        description: "All items in your cart are either coming soon or already purchased.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // For now, handle the first item in the cart
      const item = availableItems[0];
      const planType = item.selectedPlan || 'monthly';
      
      const response = await fetch('https://all.staging.crispai.ca/api/stripe/create-checkout/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool_id: item.id, 
          plan_type: planType
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          toast({
            title: "Checkout Failed",
            description: "Unable to create checkout session. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        const error = await response.json();
        toast({
          title: "Checkout Failed",
          description: error.detail || "An error occurred during checkout. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "An error occurred during checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualRefresh = async () => {
    console.log('Manual subscription refresh triggered');
    toast({
      title: "Refreshing Purchases",
      description: "Checking your purchased apps...",
    });
    
    try {
      await checkSubscription();
      toast({
        title: "Purchases Updated",
        description: "Your purchase status has been refreshed.",
      });
    } catch (error) {
      console.error('Manual refresh error:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to check purchase status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter out already purchased apps from total calculation
  const availableForPurchase = cartItems.filter(item => !item.isComingSoon && !hasPurchased(item.name));
  const hasItemsForPurchase = availableForPurchase.length > 0;
  
  // Calculate total based on selected plans
  const totalCost = availableForPurchase.reduce((sum, item) => {
    const price = item.selectedPlan === 'yearly' ? item.yearlyPrice : item.monthlyPrice;
    return sum + price;
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Your cart is empty</p>
                {user && (
                  <button
                    onClick={handleManualRefresh}
                    className="mt-4 text-blue-500 hover:text-blue-600 text-sm underline"
                  >
                    Check Purchase Status
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <img src={item.icon} alt={item.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      <p className="text-blue-600 text-xs font-semibold">
                        {item.selectedPlan === 'yearly' 
                          ? `$${item.yearlyPrice}/year` 
                          : `$${item.monthlyPrice}/month`}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {item.selectedPlan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
                      </p>
                      {item.isComingSoon && (
                        <p className="text-gray-500 text-xs">Coming Soon</p>
                      )}
                      {hasPurchased(item.name) && (
                        <p className="text-green-600 text-xs">✓ Already Purchased</p>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t p-6 space-y-4">
              {hasItemsForPurchase && (
                <div className="text-center text-lg font-semibold text-gray-900 mb-4">
                  Total: ${totalCost.toFixed(2)}
                </div>
              )}
              
              {availableForPurchase.length < cartItems.length && (
                <div className="text-center text-green-600 text-sm font-medium">
                  ✓ Some items already purchased
                </div>
              )}
              
              <div className="space-y-2">
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isProcessing || !hasItemsForPurchase}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isProcessing || !hasItemsForPurchase
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isProcessing 
                    ? 'Processing...' 
                    : !hasItemsForPurchase
                    ? 'No Items to Purchase'
                    : `Proceed to Checkout`
                  }
                </button>
                
                {/* {user && (
                  <button
                    onClick={handleManualRefresh}
                    className="w-full py-2 px-4 rounded-lg font-medium text-blue-500 border border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    Refresh Purchase Status
                  </button>
              )} */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
