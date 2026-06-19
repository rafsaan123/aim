"use client";

import { useEffect, useRef, useState } from "react";
import { formatTimer } from "@/lib/test-timer";

type TestTimerProps = {
  expiresAt: string | null;
  onExpire: () => void;
};

export function TestTimer({ expiresAt, onExpire }: TestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!expiresAt) return;

    expiredRef.current = false;
    const expireTime = new Date(expiresAt).getTime();

    function tick() {
      const remaining = Math.max(0, Math.ceil((expireTime - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (!expiresAt || secondsLeft === null) return null;

  const urgent = secondsLeft <= 60;

  return (
    <div
      className={`sticky top-0 z-30 -mx-4 mb-4 flex items-center justify-between border-b px-4 py-3 ${
        urgent
          ? "border-red-200 bg-red-50 text-danger"
          : "border-indigo-200 bg-indigo-50 text-primary"
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-wide">
        Time remaining
      </span>
      <span className="font-mono text-lg font-bold">{formatTimer(secondsLeft)}</span>
    </div>
  );
}
