import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  purchasedApps: string[];
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
  hasPurchased: (appName: string) => boolean;
  subscriptionExpiry: string | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within a SubscriptionProvider");
  return context;
};

const API_BASE_URL = "https://api.crispai.ca/api/subscription";

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchasedApps, setPurchasedApps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string | null>(null);
  const [toolMap, setToolMap] = useState<{ [key: number]: string }>({});
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const hasPurchased = (appName: string): boolean => {
    return purchasedApps.includes(appName);
  };

  const fetchToolList = async (): Promise<{ [key: number]: string }> => {
    if (!token) return {};
    try {
      const response = await fetch(`${API_BASE_URL}/tools/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch tools: ${response.status}`);
      const data = await response.json();
      const mapping: { [key: number]: string } = {};
      data.forEach((tool: { id: number; name: string }) => {
        mapping[tool.id] = tool.name;
      });
      setToolMap(mapping);
      return mapping;
    } catch (error) {
      console.error("Error loading tools:", error);
      return {};
    }
  };

  const checkSubscription = async (): Promise<void> => {
    if (!token || !user) {
      setPurchasedApps([]);
      setSubscriptionExpiry(null);
      return;
    }

    setIsLoading(true);
    try {
      const currentToolMap = Object.keys(toolMap).length > 0 ? toolMap : await fetchToolList();

      const response = await fetch(`${API_BASE_URL}/auth/check-subscription/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data = await response.json();

      // Align with Django: expects { has_access: true, tools: [tool_ids] }
      if (data.has_access && Array.isArray(data.tools)) {
        const mappedApps = data.tools
          .map((toolId: number) => currentToolMap[toolId])
          .filter(Boolean);

        setPurchasedApps(mappedApps);
        setSubscriptionExpiry(data.expiry_date || null);
      } else {
        setPurchasedApps([]);
        setSubscriptionExpiry(null);
      }
    } catch (error) {
      console.error("Subscription check failed:", error);
      setPurchasedApps([]);
      setSubscriptionExpiry(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscription = async (): Promise<void> => {
    await fetchToolList();
    await checkSubscription();
  };

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isPaymentSuccess =
        urlParams.has("session_id") ||
        urlParams.get("status") === "success" ||
        urlParams.get("success") === "true";

      if (isPaymentSuccess && token && user) {
        window.history.replaceState({}, document.title, window.location.pathname);
        await fetchToolList();

        let retries = 3;
        while (retries > 0) {
          await checkSubscription();
          if (purchasedApps.length > 0) break;
          retries--;
          if (retries > 0) await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    };

    handlePaymentSuccess();
  }, [token, user, toolMap]);

  useEffect(() => {
    if (token && user) {
      const initialize = async () => {
        await fetchToolList();
        await checkSubscription();
      };
      initialize();
      intervalRef.current = setInterval(checkSubscription, 24 * 60 * 60 * 1000);
    } else {
      setPurchasedApps([]);
      setSubscriptionExpiry(null);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token, user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && token && user) {
        checkSubscription();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, user]);

  return (
    <SubscriptionContext.Provider
      value={{
        purchasedApps,
        isLoading,
        checkSubscription,
        hasPurchased,
        subscriptionExpiry,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
