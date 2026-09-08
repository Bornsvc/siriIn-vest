"use client";

import { useMemo, useState } from "react";
import type { AppNotification, NotificationKind } from "@/shared/types";
import { cn } from "@/shared/lib/cn";
import {
  Button,
  ButtonLink,
  Card,
  EmptyState,
  RowList,
  Tabs,
  type TabItem,
} from "@/shared/ui";
import { IconCheck } from "@/shared/ui/icons";
import { EMPTY_COPY, KIND_META, KIND_ORDER } from "../lib/kinds";
import { RelativeTime } from "@/shared/ui/relative-time";

type Filter = "all" | NotificationKind;

const EMPTY_ACTION: Partial<Record<Filter, { href: string; label: string }>> = {
  order: { href: "/market", label: "Browse the market" },
  price: { href: "/market", label: "Find a stock to watch" },
  account: { href: "/wallet", label: "Go to wallet" },
};

export function NotificationCenter({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  // Read state is local: the mock is the server's opinion, this is the
  // customer's session on top of it.
  const [readIds, setReadIds] = useState<string[]>(() =>
    notifications.filter((item) => item.read).map((item) => item.id),
  );

  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
      ),
    [notifications],
  );

  const isRead = (id: string) => readIds.includes(id);
  const unread = sorted.filter((item) => !isRead(item.id)).length;

  const tabs: TabItem<Filter>[] = [
    { value: "all", label: "All", count: unread > 0 ? unread : undefined },
    ...KIND_ORDER.map((kind) => ({
      value: kind as Filter,
      label: KIND_META[kind].label,
    })),
  ];

  const visible =
    filter === "all" ? sorted : sorted.filter((item) => item.kind === filter);

  const action = EMPTY_ACTION[filter];

  return (
    <>
      <div className="mb-4 space-y-3 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:space-y-0">
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-thin sm:mx-0 sm:min-w-0 sm:px-0">
          <Tabs items={tabs} value={filter} onChange={setFilter} />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          disabled={unread === 0}
          onClick={() => setReadIds(sorted.map((item) => item.id))}
        >
          <IconCheck className="size-4" />
          {unread === 0 ? "All read" : "Mark all as read"}
        </Button>
      </div>

      <Card className="overflow-hidden">
        {visible.length === 0 ? (
          <EmptyState
            title={EMPTY_COPY[filter].title}
            body={EMPTY_COPY[filter].body}
            action={
              action ? (
                <ButtonLink href={action.href} size="sm" variant="secondary">
                  {action.label}
                </ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <RowList>
            {visible.map((item) => (
              <NotificationRow
                key={item.id}
                notification={item}
                read={isRead(item.id)}
                onToggle={() =>
                  setReadIds((current) =>
                    current.includes(item.id)
                      ? current.filter((id) => id !== item.id)
                      : [...current, item.id],
                  )
                }
              />
            ))}
          </RowList>
        )}
      </Card>

      <p className="mt-3 text-[12px] text-ink-400">
        Notifications are kept for 90 days. Price and order alerts are also sent
        to your phone unless you turn them off in Settings.
      </p>
    </>
  );
}

/**
 * The row is a button in both states rather than only when unread, so acting on
 * one does not yank keyboard focus out of the list — and a misfire is undoable.
 */
function NotificationRow({
  notification,
  read,
  onToggle,
}: {
  notification: AppNotification;
  read: boolean;
  onToggle: () => void;
}) {
  const meta = KIND_META[notification.kind];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={
        read
          ? `Mark "${notification.title}" as unread`
          : `Mark "${notification.title}" as read`
      }
      className={cn(
        "flex w-full items-start gap-3 px-5 py-4 text-left transition-colors",
        // The row runs edge to edge inside a clipped card, so pull the global
        // focus ring inward rather than let it be cropped away.
        "focus-visible:outline-offset-[-3px]",
        read ? "bg-surface hover:bg-canvas" : "bg-brand-50/50 hover:bg-brand-50",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full ring-1 ring-inset",
          meta.tint,
        )}
      >
        <Icon className="size-[17px]" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 text-[13px] leading-snug",
              read ? "font-normal text-ink-700" : "font-semibold text-ink-950",
            )}
          >
            {notification.title}
          </span>
          {read ? null : (
            <>
              <span
                aria-hidden
                className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500"
              />
              <span className="sr-only">Unread.</span>
            </>
          )}
        </span>

        <span className="mt-1 block text-[13px] leading-relaxed text-ink-400">
          {notification.body}
        </span>

        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-300">
          <span className="lao text-brand-600">{meta.labelLo}</span>
          <span>{meta.singular}</span>
          <span aria-hidden>·</span>
          <RelativeTime iso={notification.at} className="text-ink-400" />
        </span>
      </span>
    </button>
  );
}
