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
      return_url: returnUrl || window.location.href
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to create checkout session');
  }

  const data: CheckoutResponse = await response.json();
  return data.checkout_url;
};

