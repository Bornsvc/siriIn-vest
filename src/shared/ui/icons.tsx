import type { SVGProps } from "react";

/**
 * One icon hand for the whole product: 24px grid, 1.6 stroke, round caps.
 * Add to this file rather than inlining one-off SVGs, or the set drifts.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-[18px]"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 10.5 12 4l8.5 6.5V19a1 1 0 0 1-1 1h-4v-5h-7v5h-4a1 1 0 0 1-1-1z" />
  </Icon>
);

export const IconMarket = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 19V9M9 19V5M14 19v-6M19 19v-9" />
  </Icon>
);

export const IconPortfolio = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12h18" />
  </Icon>
);

export const IconWallet = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2M3 8v9a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-2M3 8h15a2 2 0 0 1 2 2v2m0 0h-3.5a1.5 1.5 0 0 0 0 3H20" />
  </Icon>
);

export const IconBell = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 4.5-1.5 6-1.5 6h15S18 13 18 8.5zM13.7 18.5a2 2 0 0 1-3.4 0" />
  </Icon>
);

export const IconUser = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </Icon>
);

export const IconSettings = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6" />
  </Icon>
);

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Icon>
);

export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9.5 5 7 7-7 7" />
  </Icon>
);

export const IconArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12H4m0 0 6-6m-6 6 6 6" />
  </Icon>
);

export const IconArrowUpRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 17 17 7m0 0H8m9 0v9" />
  </Icon>
);

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Icon>
);

export const IconStar = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 4 2.4 5.1 5.6.8-4 4 .9 5.6-4.9-2.7-4.9 2.7.9-5.6-4-4 5.6-.8z" />
  </Icon>
);

export const IconShield = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5 5 6v6c0 4.2 3 7.4 7 8.5 4-1.1 7-4.3 7-8.5V6z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

export const IconBank = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 9.5 12 5l8.5 4.5M5 10v7m4-7v7m6-7v7m4-7v7M3.5 20h17" />
  </Icon>
);

export const IconQr = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="6" height="6" rx="1" />
    <rect x="14" y="4" width="6" height="6" rx="1" />
    <rect x="4" y="14" width="6" height="6" rx="1" />
    <path d="M14 14h2.5v2.5M20 14v.01M20 17.5V20h-2.5M14 20v-2.5" />
  </Icon>
);

export const IconDeposit = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4v11m0 0 4-4m-4 4-4-4M4 19h16" />
  </Icon>
);

export const IconWithdraw = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 15V4m0 0 4 4m-4-4L8 8M4 19h16" />
  </Icon>
);

export const IconSwap = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8h13m0 0-3.5-3.5M17 8l-3.5 3.5M20 16H7m0 0 3.5-3.5M7 16l3.5 3.5" />
  </Icon>
);

export const IconClock = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Icon>
);

export const IconLogout = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8M17 15l3-3-3-3M10 12h10" />
  </Icon>
);

export const IconMenu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const IconX = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

/* ---- Identity and verification ---- */

export const IconEye = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </Icon>
);

export const IconEyeOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10.4 6.1A9.6 9.6 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a16.4 16.4 0 0 1-3.2 3.9" />
    <path d="M6.4 7.9A16.3 16.3 0 0 0 2.5 12S6 18.2 12 18.2a9.5 9.5 0 0 0 3.5-.65" />
    <path d="M10.1 10.1a2.7 2.7 0 0 0 3.8 3.8" />
    <path d="m4 4 16 16" />
  </Icon>
);

/** National ID card or passport. */
export const IconIdCard = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="11" r="1.9" />
    <path d="M6.2 15.8c.6-1.2 1.6-1.8 2.8-1.8s2.2.6 2.8 1.8M14.6 10.2h4M14.6 13.6h4" />
  </Icon>
);

/** Liveness check — a face inside a capture frame. */
export const IconSelfie = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8.5V6a2 2 0 0 1 2-2h2.5M15.5 4H18a2 2 0 0 1 2 2v2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5M8.5 20H6a2 2 0 0 1-2-2v-2.5" />
    <circle cx="12" cy="10.4" r="2.2" />
    <path d="M8.4 16.6a4.1 4.1 0 0 1 7.2 0" />
  </Icon>
);

/* ---- Account and settings ---- */

export const IconHelp = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.8 9.5a2.3 2.3 0 1 1 3 2.2c-.5.2-.8.7-.8 1.2v.6" />
    <path d="M12 16.6v.01" />
  </Icon>
);

export const IconKey = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="8" cy="12" r="3.5" />
    <path d="M11.5 12H20m0 0v3m-3.6-3v2.2" />
  </Icon>
);

/** Active sessions — a laptop and a phone. */
export const IconDevices = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13 15.5H3.5A1.5 1.5 0 0 1 2 14V6.5A1.5 1.5 0 0 1 3.5 5H14a1.5 1.5 0 0 1 1.5 1.5V8" />
    <path d="M5.5 18.5h6" />
    <rect x="17" y="9" width="5" height="9.5" rx="1.5" />
  </Icon>
);

export const IconGlobe = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.6 12h16.8" />
    <path d="M12 3.5c2.1 2.4 3.3 5.4 3.3 8.5s-1.2 6.1-3.3 8.5c-2.1-2.4-3.3-5.4-3.3-8.5S9.9 5.9 12 3.5z" />
  </Icon>
);

/** Price display — the dollar sign, not a generic coin. */
export const IconCurrency = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M14.6 9.4c-.5-.8-1.5-1.3-2.6-1.3-1.5 0-2.6.8-2.6 1.9s1 1.7 2.6 2 2.7.8 2.7 2-1.2 1.9-2.7 1.9c-1.1 0-2.1-.5-2.6-1.3" />
    <path d="M12 6.6v10.8" />
  </Icon>
);

export const IconInfo = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11.2v5.2M12 7.7v.01" />
  </Icon>
);

export const IconDocument = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.5 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8.5z" />
    <path d="M13.5 3.5v5h5M9 13h6M9 16.5h4" />
  </Icon>
);

export const IconLock = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4.5" y="10" width="15" height="10" rx="2" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
  </Icon>
);
