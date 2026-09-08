import Link from "next/link";
import { Logo } from "@/shared/ui";

const DOCS = [
  { href: "/legal/terms", label: "Terms of service", lo: "ເງື່ອນໄຂການໃຫ້ບໍລິການ" },
  { href: "/legal/privacy", label: "Privacy policy", lo: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ" },
];

export default function LegalLayout({ children }: LayoutProps<"/legal">) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-5">
          <Link href="/" aria-label="SiriInvest home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-4 text-[13px]">
            {DOCS.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="text-ink-500 transition-colors hover:text-brand-700"
              >
                {doc.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-14">{children}</main>

      <footer className="border-t border-line px-5 py-8 text-center">
        <Link
          href="/"
          className="text-[13px] font-medium text-brand-700 hover:text-brand-800"
        >
          Back to SiriInvest
        </Link>
      </footer>
    </div>
  );
}
