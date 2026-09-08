"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { Input } from "@/shared/ui";
import { IconEye, IconEyeOff } from "@/shared/ui/icons";

/**
 * Password field with a real show/hide button — not an icon with a click
 * handler bolted on. It is focusable, it announces which state it will move
 * to, and it never steals the field's own tab stop.
 */
export function PasswordInput({
  className,
  ...props
}: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  const action = visible ? "Hide password" : "Show password";

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-pressed={visible}
        aria-label={action}
        title={action}
        className="absolute inset-y-px right-px grid w-11 place-items-center rounded-r-[9px] text-ink-400 transition-colors hover:text-ink-800"
      >
        {visible ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
}
