import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: string;
  is_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    repeatPassword: string
  ) => Promise<string>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  verifyEmail: (uid: string, token: string) => Promise<boolean>;
  checkTokenExpiry: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const API_BASE_URL = 'https://all.crispai.ca/api/auth'; 

const endpoints = {
  register: `${API_BASE_URL}/register/`,
  login: `${API_BASE_URL}/login/`,
  activate: (uid: string, token: string) => `${API_BASE_URL}/activate/${uid}/${token}/`,
  tools: `${API_BASE_URL}/tools/`,
  createCheckout: `${API_BASE_URL}/stripe/create-checkout/`,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        logout();
      }
    }
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoints.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Check if this is an unverified account error
        if (data.detail && (
          data.detail.includes('account is not verified') ||
          data.detail.includes('not verified') ||
          data.detail.includes('verify your email') ||
          data.detail.includes('account not activated') ||
          data.detail.includes('activation required') ||
          data.detail.includes('email verification') ||
          data.detail.includes('activate your account')
        )) {
          throw new Error('Please verify your email first. Check your inbox for the activation link.');
        }
        throw new Error(data.detail || 'Login failed');
      }

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      

      const userData = data.user;
      const authenticatedUser: User = {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        role: userData.role,
        is_verified: userData.is_verified || true,
      };

      setUser(authenticatedUser);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    repeatPassword: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoints.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          password,
          repeat_password: repeatPassword,
        }),
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : { detail: 'Unexpected server error. Check endpoint URL.' };

      if (!response.ok) {
        const errMsg = data.detail || data.error || 'Registration failed';
        throw new Error(errMsg);
      }

      return data.detail || 'Verification email sent. Please check your inbox.';
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (uid: string, token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoints.activate(uid, token));
      if (!response.ok) throw new Error('Verification failed');

      if (user) {
        const verifiedUser = { ...user, is_verified: true };
        setUser(verifiedUser);
        localStorage.setItem('user', JSON.stringify(verifiedUser));
      }

      return true;
    } catch (error) {
      console.error('Verification error:', error);
      setError(error instanceof Error ? error.message : 'Verification failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const checkTokenExpiry = (): boolean => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        error,
        verifyEmail,
        checkTokenExpiry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// === STRIPE CHECKOUT UTILITIES ===

interface CheckoutResponse {
  checkout_url: string;
}

export const fetchToolIdByName = async (toolName: string): Promise<string> => {
  const response = await fetch(endpoints.tools);
  if (!response.ok) throw new Error('Unable to fetch tools');

  const data = await response.json();
  const tool = data.find((t: { name: string }) => t.name === toolName);
  if (!tool) throw new Error('Tool not found');
  return tool.id.toString();
};

export const createCheckoutSession = async (toolName: string): Promise<string> => {
  const toolId = await fetchToolIdByName(toolName);

  const response = await fetch(endpoints.createCheckout, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool_id: toolId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Checkout failed');
  }

  const data: CheckoutResponse = await response.json();
  return data.checkout_url;
};
