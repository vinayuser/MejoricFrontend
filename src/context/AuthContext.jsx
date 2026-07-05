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
  const [signupTrialExhausted, setSignupTrialExhausted] = useState(false);
  const [isWithinSignupTrial, setIsWithinSignupTrial] = useState(false);
  const [signupTrialRemainingSeconds, setSignupTrialRemainingSeconds] = useState(0);
  const [hasPaidRecharge, setHasPaidRecharge] = useState(false);

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

  const refreshSignupTrialStatus = useCallback(async () => {
    try {
      const result = await apiGet("/auth/check-signup-trial");
      if (result?.success && result.data) {
        setSignupTrialExhausted(Boolean(result.data.isExhausted));
        setIsWithinSignupTrial(Boolean(result.data.isWithinTrial));
        setHasPaidRecharge(Boolean(result.data.hasPaidRecharge));
        setSignupTrialRemainingSeconds(result.data.remainingSeconds || 0);
        localStorage.setItem(
          "signupTrialExhausted",
          String(Boolean(result.data.isExhausted)),
        );
      }
    } catch (error) {
      console.error("Error checking signup trial status:", error);
    }
  }, []);

  const refreshWalletBalance = useCallback(async () => {
    try {
      const result = await apiGet("/wallet");
      if (result && result.success && result.data) {
        const inrBalance = result.data.balances?.INR || 0;
        setWalletBalance(inrBalance);
        localStorage.setItem("walletBalance", inrBalance.toString());
        return inrBalance;
      }
    } catch (error) {
      console.error("Error refreshing wallet balance:", error);
      // Do not keep a stale localStorage balance when the server has no / errored wallet.
      setWalletBalance(0);
      localStorage.removeItem("walletBalance");
    }
    return 0;
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedBalance = localStorage.getItem("walletBalance");
    let storedToken = localStorage.getItem("authToken");
    const storedExhausted = localStorage.getItem("guestTrialExhausted");
    const storedSignupExhausted = localStorage.getItem("signupTrialExhausted");

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

    if (storedSignupExhausted) {
      setSignupTrialExhausted(storedSignupExhausted === "true");
    }

    setAuthInitialized(true);
  }, []);

  // Refresh wallet balance and guest trial status after session restore
  useEffect(() => {
    if (!authInitialized) return;

    refreshGuestTrialStatus();

    if (isAuthenticated && user?.role === "user") {
      refreshSignupTrialStatus();
    }

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
    refreshSignupTrialStatus,
  ]);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));

    if (userData?.token) {
      localStorage.setItem("authToken", userData.token);
    }

    if (userData?.role === "user") {
      void refreshSignupTrialStatus();
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
    localStorage.removeItem("signupTrialExhausted");
    setSignupTrialExhausted(false);
    setIsWithinSignupTrial(false);
    setHasPaidRecharge(false);
    setSignupTrialRemainingSeconds(0);
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
      signupTrialExhausted,
      isWithinSignupTrial,
      hasPaidRecharge,
      signupTrialRemainingSeconds,
      login,
      logout,
      addToWallet,
      deductFromWallet,
      refreshWalletBalance,
      refreshGuestTrialStatus,
      refreshSignupTrialStatus,
    }),
    [
      user,
      walletBalance,
      isAuthenticated,
      authInitialized,
      guestTrialExhausted,
      signupTrialExhausted,
      isWithinSignupTrial,
      hasPaidRecharge,
      signupTrialRemainingSeconds,
      refreshWalletBalance,
      refreshGuestTrialStatus,
      refreshSignupTrialStatus,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
