import Link from "next/link";
import { IconArrowLeft } from "@/shared/ui/icons";

/** Sub-page escape hatch. Sits above the page header so it reads as an exit. */
export function BackToWallet() {
  return (
    <Link
      href="/wallet"
      className="mb-4 -ml-1 inline-flex items-center gap-1.5 rounded-[8px] px-1 py-1 text-[13px] font-medium text-ink-400 transition-colors hover:text-brand-800"
    >
      <IconArrowLeft className="size-4" />
      Back to wallet
      <span className="lao text-[11px] text-ink-300">ກັບໄປກະເປົາເງິນ</span>
    </Link>
  );
}
