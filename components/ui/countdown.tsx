"use client";

import { useEffect, useState } from "react";

const TARGET = new Date("2026-07-01T00:00:00.000Z");

function getTimeLeft() {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, done: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    done: false
  };
}

export function Countdown() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (time.done) {
    return <span className="text-[15px] font-bold text-green">Launched.</span>;
  }

  return (
    <div className="flex items-baseline gap-3 tabular-nums">
      <Unit label="days" value={time.days} />
      <Unit label="hrs" value={time.hours} />
      <Unit label="min" value={time.minutes} />
    </div>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-[22px] font-bold tracking-[-0.02em]">{value}</span>
      <span className="text-[11px] text-tertiary">{label}</span>
    </div>
  );
}
