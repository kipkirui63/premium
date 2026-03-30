import { apiRequest } from '../lib/api';

interface CheckoutResponse {
  checkout_url: string;
}

export const createCheckoutSession = async (
  _token: string,
  toolId: number | string,
  planType: 'monthly' | 'yearly' = 'monthly',
  returnUrl?: string
): Promise<string> => {
  const data = await apiRequest<CheckoutResponse>('/stripe/create-checkout/', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ 
      tool_id: toolId,
      plan_type: planType,
      return_url: returnUrl || window.location.href
    })
  });
  return data.checkout_url;
};
