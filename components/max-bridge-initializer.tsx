"use client";

import { useEffect } from "react";
import { maxBridge } from "@/lib/max-bridge";

export function MAXBridgeInitializer() {
  useEffect(() => {
    if (maxBridge.isMaxEnvironment()) {
      maxBridge.ready();
      maxBridge.expand();
    }
  }, []);

  return null;
}
