"use client";

import { useSyncExternalStore } from "react";
import { USER } from "@/mock/account";

const PARTS = [
  { until: 12, lo: "ສະບາຍດີຕອນເຊົ້າ", en: "Good morning" },
  { until: 17, lo: "ສະບາຍດີຕອນບ່າຍ", en: "Good afternoon" },
  { until: 24, lo: "ສະບາຍດີຕອນແລງ", en: "Good evening" },
];

/** The wall clock never changes mid-session, so there is nothing to subscribe to. */
const noSubscribe = () => () => {};

/**
 * Resolved on the client — a server-rendered greeting would be wrong for anyone
 * whose hour differs from the server's, and would hydrate as a mismatch.
 * `useSyncExternalStore` is the sanctioned way to read a browser-only value:
 * it renders the server snapshot during hydration, then the real one.
 */
export function Greeting() {
  const hour = useSyncExternalStore(
    noSubscribe,
    () => new Date().getHours(),
    () => null,
  );

  const part =
    hour === null
      ? null
      : (PARTS.find((entry) => hour < entry.until) ?? PARTS[2]);

  const firstName = USER.name.split(" ")[0];

  return (
    <div className="mb-6">
      <p className="lao text-[13px] leading-none text-brand-600">
        {part?.lo ?? " "}
      </p>
      <h1 className="mt-1.5 font-display text-[26px] font-medium leading-none tracking-[-0.02em] text-ink-950">
        {part ? `${part.en}, ${firstName}` : firstName}
      </h1>
    </div>
  );
}
