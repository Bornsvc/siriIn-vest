"use client";

import { useEffect, useState } from "react";
import { formatRelative } from "@/shared/lib/format";

/**
 * `formatRelative` needs a `now`, and a `now` picked on the server is stale by
 * the time it hydrates. So the first paint carries a timezone-pinned calendar
 * date — identical on both sides, and still useful without JavaScript — and the
 * relative phrasing arrives after mount.
 *
 * Vientiane-pinned deliberately: a customer reading "07 Sept" means their own
 * evening, not the server's.
 */
const CALENDAR = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "Asia/Vientiane",
});

const FULL = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Vientiane",
});

export function RelativeTime({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const date = new Date(iso);

  return (
    <time
      dateTime={iso}
      title={`${FULL.format(date)} (Vientiane)`}
      data-numeric
      className={className}
    >
      {now ? formatRelative(iso, now) : CALENDAR.format(date)}
    </time>
  );
}
