import { loadStripe } from '@stripe/stripe-js';
const API_BASE_URL = 'https://all.crispai.ca/api';
// Fetch Stripe publishable key from backend
const fetchStripeConfig = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stripe/config/`);
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