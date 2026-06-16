import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { apiGet, apiPost } from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestTrialExhausted, setGuestTrialExhausted] = useState(false);

  const refreshGuestTrialStatus = useCallback(async () => {
    try {
      const result = await apiGet("/auth/check-guest-limit", true);
      if (result && result.success && result.data) {
        setGuestTrialExhausted(result.data.isExhausted);
        localStorage.setItem("guestTrialExhausted", String(result.data.isExhausted));
      }
    } catch (error) {
      console.error("Error checking guest trial status:", error);
    }
  }, []);

  const refreshWalletBalance = useCallback(async () => {
    try {
      const result = await apiGet("/wallet");
      if (result && result.success && result.data) {
        const inrBalance = result.data.balances?.INR || 0;
        setWalletBalance(inrBalance);
        localStorage.setItem("walletBalance", inrBalance.toString());
      }
    } catch (error) {
      console.error("Error refreshing wallet balance:", error);
      // Do not keep a stale localStorage balance when the server has no / errored wallet.
      setWalletBalance(0);
      localStorage.removeItem("walletBalance");
    }
  }, []);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem("user");
    const storedBalance = localStorage.getItem("walletBalance");
    const storedToken = localStorage.getItem("authToken");
    const storedExhausted = localStorage.getItem("guestTrialExhausted");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      // Clear any partial data if both aren't present
      setIsAuthenticated(false);
      setUser(null);
    }

    if (storedBalance) {
      setWalletBalance(parseFloat(storedBalance));
    }

    if (storedExhausted) {
      setGuestTrialExhausted(storedExhausted === "true");
    }

    // Check for existing auth token
    if (storedToken) {
      console.log("✅ Found existing auth token on load");
    }
  }, []);

  // Refresh wallet balance and guest trial status when page loads and user is authenticated
  useEffect(() => {
    refreshGuestTrialStatus();
    if (isAuthenticated) {
      refreshWalletBalance();
    }
  }, [isAuthenticated, refreshWalletBalance, refreshGuestTrialStatus]);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));

    // Check if this is first login (no existing wallet balance)
    const existingBalance = localStorage.getItem("walletBalance");
    if (!existingBalance) {
      const trialDurationSeconds = parseInt(import.meta.env.VITE_TRIAL_CHAT_DURATION) || 180;
      const freeMinutes = trialDurationSeconds / 60; // Convert seconds to minutes
      const chatPricePerMin = parseInt(import.meta.env.VITE_CHAT_PRICE_PER_MIN) || 8;
      const freeWalletRecharge = parseInt(import.meta.env.VITE_FREE_WALLET_RECHARGE) || 100;

      setWalletBalance(freeWalletRecharge);
      localStorage.setItem("walletBalance", freeWalletRecharge.toString());
    }
  };

  const logout = () => {
    void apiPost("/auth/logout", {}).catch(() => { });
    setUser(null);
    setIsAuthenticated(false);
    setWalletBalance(0);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("walletBalance");
  };

  const addToWallet = (amount) => {
    const newBalance = walletBalance + amount;
    setWalletBalance(newBalance);
    localStorage.setItem("walletBalance", newBalance.toString());
  };

  const deductFromWallet = (amount) => {
    if (walletBalance >= amount) {
      const newBalance = walletBalance - amount;
      setWalletBalance(newBalance);
      localStorage.setItem("walletBalance", newBalance.toString());
      return true;
    }
    return false;
  };

  const value = useMemo(
    () => ({
      user,
      walletBalance,
      isAuthenticated,
      guestTrialExhausted,
      login,
      logout,
      addToWallet,
      deductFromWallet,
      refreshWalletBalance,
      refreshGuestTrialStatus,
    }),
    [user, walletBalance, isAuthenticated, guestTrialExhausted, refreshWalletBalance, refreshGuestTrialStatus],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
