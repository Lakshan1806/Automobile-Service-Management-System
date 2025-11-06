"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/app/auth/api";
import type { Customer } from "@/app/auth/auth";

type AuthContextValue = {
  customer: Customer | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (profile: Customer) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const PROFILE_STORAGE_KEY = "novadrive.customer.profile";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(() =>
    readStoredProfile(),
  );
  const [loading, setLoading] = useState(true);

  const persistProfile = useCallback((profile: Customer | null) => {
    setCustomer(profile);

    if (typeof window === "undefined") {
      return;
    }

    if (profile) {
      window.localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profile),
      );
    } else {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<{ customer: Customer }>(
        "/api/profile",
      );
      persistProfile(data.customer);
    } catch (error) {
      console.info("Customer session refresh failed.", error);
      persistProfile(null);
      throw error;
    }
  }, [persistProfile]);

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

  const login = useCallback(
    async (profile: Customer) => {
      persistProfile(profile);
      setLoading(false);
    },
    [persistProfile],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/customers/logout");
    } catch (error) {
      console.info("Customer logout request failed.", error);
    } finally {
      persistProfile(null);
      setLoading(false);
    }
  }, [persistProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      loading,
      isAuthenticated: Boolean(customer),
      login,
      logout,
      refresh,
    }),
    [customer, loading, login, logout, refresh],
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
