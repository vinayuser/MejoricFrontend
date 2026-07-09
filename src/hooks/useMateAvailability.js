import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { apiGet, apiPut } from "../utils/api";

const GRACE_MS = 5 * 60 * 1000;
const GRACE_UNTIL_KEY = "mate_online_grace_until";

const getGraceUntil = () =>
  Number(sessionStorage.getItem(GRACE_UNTIL_KEY) || 0);

const isWithinGrace = () => Date.now() < getGraceUntil();

const extendGrace = () => {
  sessionStorage.setItem(GRACE_UNTIL_KEY, String(Date.now() + GRACE_MS));
};

const clearGrace = () => {
  sessionStorage.removeItem(GRACE_UNTIL_KEY);
};

export function useMateAvailability(user) {
  const userId = user?.user?._id ?? user?._id ?? user?.id;
  const userRole = user?.role ?? user?.user?.role;
  const isMate = userRole === "mate";

  const [isOnline, setIsOnline] = useState(() => isWithinGrace());
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const isOnlineRef = useRef(isOnline);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    if (!isMate) return undefined;

    const onPageHide = () => {
      if (isOnlineRef.current) {
        extendGrace();
      }
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [isMate]);

  useEffect(() => {
    if (!isMate || !userId) return;

    const fetchMateStatus = async () => {
      try {
        const token = user?.token || localStorage.getItem("authToken");
        if (!token) return;

        const result = await apiGet("/users/get");
        if (!result?.success || !result.data) return;

        const serverOnline = Boolean(result.data.mate?.isAvailable);

        if (serverOnline) {
          extendGrace();
          setIsOnline(true);
          return;
        }

        if (isWithinGrace()) {
          setIsOnline(true);
          try {
            await apiPut(`/users/update?userId=${userId}`, {
              isAvailable: true,
              availabilitySource: "mate_app",
            });
            extendGrace();
          } catch {
            /* keep UI online for grace window */
          }
          return;
        }

        clearGrace();
        setIsOnline(false);
      } catch (error) {
        console.error("Error fetching mate status:", error);
        if (isWithinGrace()) {
          setIsOnline(true);
        }
      }
    };

    fetchMateStatus();
  }, [isMate, userId, user?.token]);

  const toggleOnlineStatus = useCallback(async () => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const newStatus = !isOnline;
      const result = await apiPut(`/users/update?userId=${userId}`, {
        isAvailable: newStatus,
        availabilitySource: "mate_app",
      });

      if (result.success) {
        setIsOnline(newStatus);
        if (newStatus) {
          extendGrace();
        } else {
          clearGrace();
        }
        toast.success(`You are now ${newStatus ? "online" : "offline"}`);
      } else {
        toast.error(result.message || "Failed to update status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [userId, isOnline]);

  const setOffline = useCallback(async () => {
    if (!userId) return false;

    try {
      const result = await apiPut(`/users/update?userId=${userId}`, {
        isAvailable: false,
        availabilitySource: "logout",
      });
      if (result.success) {
        setIsOnline(false);
        clearGrace();
        return true;
      }
    } catch (error) {
      console.error("Error setting user to offline:", error);
    }
    return false;
  }, [userId]);

  return {
    isOnline: isMate ? isOnline : false,
    isUpdatingStatus,
    toggleOnlineStatus,
    setOffline,
    setIsOnline,
  };
}
