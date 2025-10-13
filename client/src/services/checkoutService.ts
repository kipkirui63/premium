const API_BASE_URL = 'https://all.staging.crispai.ca/api';

interface CheckoutResponse {
  checkout_url: string;
}

export const createCheckoutSession = async (
  token: string,
  toolId: number | string,
  planType: 'monthly' | 'yearly' = 'monthly',
  returnUrl?: string
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/stripe/create-checkout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ 
      tool_id: toolId,
      plan_type: planType,
      return_url: returnUrl || window.location.href  // Use provided URL or current page
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to create checkout session');
  }

  const data: CheckoutResponse = await response.json();
  return data.checkout_url;
};

import { loadStripe } from '@stripe/stripe-js';

// Fetch Stripe publishable key from backend
const fetchStripeConfig = async () => {
  try {
    const response = await fetch('https://all.staging.crispai.ca/api/stripe/config/');
    if (!response.ok) {
      throw new Error('Failed to fetch Stripe config');
    }
    const data = await response.json();
    return data.publishable_key;
  } catch (error) {
    console.error('Error fetching Stripe config:', error);
    // Fallback to environment variable
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  }
};

// Initialize Stripe with publishable key from backend
let stripePromise: Promise<any> | null = null;

export const getStripe = async () => {
  if (!stripePromise) {
    const publishableKey = await fetchStripeConfig();
    if (!publishableKey) {
      throw new Error('Stripe publishable key not found');
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default getStripe;