
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

const SubscriptionWarning = () => {
  const { purchasedApps, subscriptionExpiry } = useSubscription();
  const [showWarning, setShowWarning] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (purchasedApps.length === 0 || !subscriptionExpiry || dismissed) {
      setShowWarning(false);
      return;
    }

    const expiryDate = new Date(subscriptionExpiry);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Show warning if any purchases expire within 3 days
    if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [purchasedApps, subscriptionExpiry, dismissed]);

  if (!showWarning) return null;

  const expiryDate = new Date(subscriptionExpiry!);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start space-x-3">
      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="text-sm font-medium text-yellow-800">
          Apps Expiring Soon
        </h3>
        <p className="text-sm text-yellow-700 mt-1">
          Your purchased apps will expire in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} on {expiryDate.toLocaleDateString()}. 
          Renew now to continue accessing your apps.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-yellow-600 hover:text-yellow-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SubscriptionWarning;
