"use client";

import { useEffect, useRef } from "react";

export function ActivityTracker() {
  const lastPingRef = useRef<number>(0);

  useEffect(() => {
    const ping = () => {
      const now = Date.now();
      // Throttle pings to once every 60 seconds
      if (now - lastPingRef.current > 60000) {
        lastPingRef.current = now;
        try {
          fetch("/api/system/activity", { method: "POST" }).catch(() => {});
        } catch {
          // ignore network errors
        }
      }
    };

    // Ping once on mount
    ping();

    // Listen to user interactions
    const handleUserAction = () => {
      ping();
    };

    window.addEventListener("click", handleUserAction, { passive: true });
    window.addEventListener("keydown", handleUserAction, { passive: true });
    window.addEventListener("touchstart", handleUserAction, { passive: true });

    return () => {
      window.removeEventListener("click", handleUserAction);
      window.removeEventListener("keydown", handleUserAction);
      window.removeEventListener("touchstart", handleUserAction);
    };
  }, []);

  return null;
}
