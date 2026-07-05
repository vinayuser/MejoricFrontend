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
  const [isOnline, setIsOnline] = useState(() => isWithinGrace());
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const isOnlineRef = useRef(isOnline);

  const getUserId = useCallback(() => {
    return user?.user?._id || user?._id || user?.id;
  }, [user]);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    const onPageHide = () => {
      if (isOnlineRef.current) {
        extendGrace();
      }
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

  useEffect(() => {
    const fetchMateStatus = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;

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
  }, [user, getUserId]);

  const toggleOnlineStatus = useCallback(async () => {
    setIsUpdatingStatus(true);
    try {
      const userId = getUserId();
      if (!userId) throw new Error("User ID not found");

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
  }, [getUserId, isOnline]);

  const setOffline = useCallback(async () => {
    const userId = getUserId();
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
  }, [getUserId]);

  return {
    isOnline,
    isUpdatingStatus,
    toggleOnlineStatus,
    setOffline,
    setIsOnline,
  };
};
