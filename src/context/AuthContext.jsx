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
  const [authInitialized, setAuthInitialized] = useState(false);
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
    const storedUser = localStorage.getItem("user");
    const storedBalance = localStorage.getItem("walletBalance");
    let storedToken = localStorage.getItem("authToken");
    const storedExhausted = localStorage.getItem("guestTrialExhausted");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const token = storedToken || parsedUser?.token;
        if (token) {
          if (!storedToken) {
            localStorage.setItem("authToken", token);
          }
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to restore user session:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    } else if (!storedToken) {
      setIsAuthenticated(false);
      setUser(null);
    }

    if (storedBalance) {
      setWalletBalance(parseFloat(storedBalance));
    }

    if (storedExhausted) {
      setGuestTrialExhausted(storedExhausted === "true");
    }

    setAuthInitialized(true);
  }, []);

  // Refresh wallet balance and guest trial status after session restore
  useEffect(() => {
    if (!authInitialized) return;

    refreshGuestTrialStatus();

    if (
      isAuthenticated &&
      user &&
      (user.role === "user" || user.role === "guest")
    ) {
      refreshWalletBalance();
    }
  }, [
    authInitialized,
    isAuthenticated,
    user,
    refreshWalletBalance,
    refreshGuestTrialStatus,
  ]);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));

    if (userData?.token) {
      localStorage.setItem("authToken", userData.token);
    }

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
      authInitialized,
      guestTrialExhausted,
      login,
      logout,
      addToWallet,
      deductFromWallet,
      refreshWalletBalance,
      refreshGuestTrialStatus,
    }),
    [
      user,
      walletBalance,
      isAuthenticated,
      authInitialized,
      guestTrialExhausted,
      refreshWalletBalance,
      refreshGuestTrialStatus,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
