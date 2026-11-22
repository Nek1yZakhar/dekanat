import React from "react";

export function MaxRobotLogo({ className = "w-4 h-4 text-blue-500" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Robot Max Head & Speech Bubble body */}
      <rect x="2.5" y="4.5" width="19" height="13" rx="4.5" fill="currentColor" />
      {/* Speech tail */}
      <path d="M6 17.5L3.5 21.5L9.5 17.5H6Z" fill="currentColor" />
      {/* Antenna */}
      <path d="M12 4.5V1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="1.5" r="1.2" fill="currentColor" />
      {/* Robot Visor / Eyes (dark cutout style for high contrast) */}
      <circle cx="8" cy="10.5" r="1.6" fill="#020617" />
      <circle cx="16" cy="10.5" r="1.6" fill="#020617" />
      {/* Friendly smile */}
      <path
        d="M9.5 13.5C10.5 14.7 13.5 14.7 14.5 13.5"
        stroke="#020617"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
