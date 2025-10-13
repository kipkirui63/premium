const API_BASE_URL = 'https://all.staging.crispai.ca/api';

interface CheckoutResponse {
  checkout_url: string;
}

export const createCheckoutSession = async (
  token: string,
  toolId: number | string,  // match backend's tool_id logic
  planType: 'monthly' | 'yearly' = 'monthly'
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/stripe/create-checkout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ 
      tool_id: toolId,        // ✅ use tool_id not tool_name
      plan_type: planType 
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to create checkout session');
  }

  const data: CheckoutResponse = await response.json();
  return data.checkout_url;
};
