import fs from "node:fs";
import path from "node:path";

const STATE_FILE = process.platform === "win32"
  ? path.join(process.cwd(), ".activity_state.json")
  : "/tmp/dekanat_activity_state.json";

export interface ActivityState {
  last_activity_at: number;
  last_reset_at: number;
  pending_reset: boolean;
}

export function recordActivity(): ActivityState {
  try {
    const now = Date.now();
    let current: ActivityState = {
      last_activity_at: now,
      last_reset_at: 0,
      pending_reset: true,
    };

    if (fs.existsSync(STATE_FILE)) {
      try {
        const raw = fs.readFileSync(STATE_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        current = {
          ...parsed,
          last_activity_at: now,
          pending_reset: true,
        };
      } catch {
        // Fallback to initial state
      }
    }

    fs.writeFileSync(STATE_FILE, JSON.stringify(current, null, 2), "utf-8");
    return current;
  } catch (err) {
    console.warn("Failed to record activity state:", err);
    return {
      last_activity_at: Date.now(),
      last_reset_at: 0,
      pending_reset: true,
    };
  }
}

export function getActivityState(): ActivityState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // Return default
  }
  return {
    last_activity_at: Date.now(),
    last_reset_at: 0,
    pending_reset: false,
  };
}
