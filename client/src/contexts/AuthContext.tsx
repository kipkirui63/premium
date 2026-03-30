import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiRequest,
  buildLoginRedirectUrl,
  clearStoredAuth,
  dispatchAuthExpired,
  getStoredAccessToken,
  getStoredRefreshToken,
  isTokenValid,
  subscribeToAuthExpired,
} from '../lib/api';

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
  login: (email: string, password: string, turnstileToken?: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    repeatPassword: string,
    turnstileToken?: string
  ) => Promise<string>;
  logout: (options?: { redirectTo?: string | null }) => void;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = getStoredAccessToken();

    if (storedUser && isTokenValid(token)) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clearStoredAuth();
      }
    } else if (storedUser || token || getStoredRefreshToken()) {
      clearStoredAuth();
    }
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthExpired((event) => {
      const reason = event.detail?.message || 'Your session has expired. Please sign in again.';
      setError(reason);
      logout({ redirectTo: buildLoginRedirectUrl('session-expired') });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const token = getStoredAccessToken();
      if (token && !isTokenValid(token)) {
        dispatchAuthExpired();
      }
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const login = async (email: string, password: string, turnstileToken?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest<{
        access: string;
        refresh: string;
        user: User;
      }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password, turnstile_token: turnstileToken }),
      });

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
        is_verified: userData.is_verified ?? true,
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
    repeatPassword: string,
    turnstileToken?: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest<{ detail?: string }>('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          password,
          repeat_password: repeatPassword,
          turnstile_token: turnstileToken,
        }),
      });

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
      await apiRequest(`/auth/activate/${uid}/${token}/`);

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

  const logout = (options?: { redirectTo?: string | null }) => {
    setUser(null);
    clearStoredAuth();

    if (options?.redirectTo) {
      window.location.assign(options.redirectTo);
    }
  };

  const checkTokenExpiry = (): boolean => {
    const token = getStoredAccessToken();
    const isValid = isTokenValid(token);
    if (!isValid && token) {
      dispatchAuthExpired();
    }
    return isValid;
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
  const data = await apiRequest<Array<{ id: number; name: string }>>('/tools/');
  const tool = data.find((t: { name: string }) => t.name === toolName);
  if (!tool) throw new Error('Tool not found');
  return tool.id.toString();
};

export const createCheckoutSession = async (toolName: string): Promise<string> => {
  const toolId = await fetchToolIdByName(toolName);

  const data = await apiRequest<CheckoutResponse>('/stripe/create-checkout/', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ tool_id: toolId }),
  });
  return data.checkout_url;
};
