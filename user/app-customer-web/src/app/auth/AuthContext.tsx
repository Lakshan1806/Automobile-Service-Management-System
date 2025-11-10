"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi, userApi, appointmentApi, locationApi } from "@/app/auth/api";
import {
  cacheVehicles,
  clearCachedVehicles,
  fetchCustomerVehicles,
  type Customer,
  type SigninResponse,
} from "@/app/auth/auth";
import { clearActiveRequest } from "@/app/roadside-assistance/activeRequestStorage";

type AuthContextValue = {
  customer: Customer | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (authData: SigninResponse) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const PROFILE_STORAGE_KEY = "novadrive.customer.profile";
const TOKEN_STORAGE_KEY = "novadrive.customer.token"; 

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
// --- FUNCTION UPDATED ---
/**
 * Attaches the JWT as a Bearer token to all API requests.
 */
function setupAxiosInterceptors(accessToken: string | null) {
  const apis = [authApi, userApi, appointmentApi, locationApi];
  
  apis.forEach(api => {
    // Clear existing interceptors to avoid duplicates
    api.interceptors.request.clear();
    
    if (accessToken) {
      api.interceptors.request.use(config => {
        // Do not add auth header to login/signup
        const unauthenticatedPaths = [
          "/api/customers/login",
          "/api/customers/signup",
          "/api/customers/signup/request-otp",
          "/api/customers/signup/verify",
        ];
        if (
          config.url &&
          unauthenticatedPaths.some((path) => config.url.endsWith(path))
        ) {
          return config;
        }
        
        // Add the header
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
      });
    }
  });
}
// --- FUNCTION UPDATED ---

function readStoredProfile(): Customer | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Customer;
  } catch (error) {
    console.warn("Failed to parse cached customer profile.", error);
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    return null;
  }
}

// --- FUNCTION UPDATED ---
function readStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}
// --- FUNCTION UPDATED ---

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(() =>
    readStoredProfile(),
  );
  // --- FUNCTION UPDATED ---
  const [token, setToken] = useState<string | null>(() =>
    readStoredToken(),
  );
  const [loading, setLoading] = useState(true);

  // --- FUNCTION UPDATED ---
  // It now also persists the access token
  const persistAuth = useCallback(
    (profile: Customer | null, accessToken: string | null) => {
      setCustomer(profile);
      setToken(accessToken);
      
      // Update the axios interceptors with the new token
      setupAxiosInterceptors(accessToken);

      if (typeof window === "undefined") {
        return;
      }

      if (profile && accessToken) {
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        window.localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      } else {
        window.localStorage.removeItem(PROFILE_STORAGE_KEY);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    // --- FUNCTION UPDATED ---
    // If we have a token in state, setup interceptors.
    // Then, try to fetch /me.
    if (!token) {
      setLoading(false);
      throw new Error("No token found");
    }
    
    setupAxiosInterceptors(token); 
    try {
      const { data } = await authApi.get<{ customer: Customer }>(
        "/api/customers/me" 
      );
      // We already have a token, just persist the profile
      persistAuth(data.customer, token);
      
      try {
        const vehicles = await fetchCustomerVehicles(data.customer.id);
        cacheVehicles(vehicles);
      } catch (error) {
        console.info("Customer vehicle preload failed.", error);
        clearCachedVehicles();
      }
    } catch (error) {
      console.info("Customer session refresh failed.", error);
      persistAuth(null, null); // Clear everything
      clearCachedVehicles();
      clearActiveRequest();
      throw error;
    }
    // --- FUNCTION UPDATED ---
  }, [persistAuth, token]);

  useEffect(() => {
    let active = true;

    refresh()
      .catch(() => {
        if (!active) {
          return;
        }
      
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refresh]);

  // --- FUNCTION UPDATED ---
  const login = useCallback(
    async (authData: SigninResponse) => {
      persistAuth(authData.customer, authData.accessToken);
      setLoading(false);
    },
    [persistAuth],
  );

  // --- FUNCTION UPDATED ---
  const logout = useCallback(async () => {
    try {
      // Still call logout to invalidate cookie (if server does that)
      await authApi.post("/api/customers/logout"); 
    } catch (error) {
      console.info("Customer logout request failed.", error);
    } finally {
      persistAuth(null, null); // Clear token and profile
      clearCachedVehicles();
      clearActiveRequest();
      setLoading(false);
    }
  }, [persistAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      loading,
      isAuthenticated: Boolean(customer && token),
      login,
      logout,
      refresh,
    }),
    [customer, token, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
