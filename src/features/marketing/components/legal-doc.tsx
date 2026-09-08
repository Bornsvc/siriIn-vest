import type { ReactNode } from "react";

export type LegalSection = { heading: string; body: string };

/**
 * Shared shell for the legal documents. They are reachable from registration
 * and from Settings, so they get real pages rather than dead links — with
 * copy that is honest about this being a demonstration build.
 */
export function LegalDoc({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <article>
      <p className="lao text-[13px] leading-none text-brand-600">{eyebrow}</p>
      <h1 className="mt-2 font-display text-[32px] font-medium leading-tight tracking-[-0.02em] text-ink-950">
        {title}
      </h1>
      <p className="mt-3 font-mono text-[12px] text-ink-400">
        Last updated {updated}
      </p>

      <div className="mt-8 rounded-card border border-brand-100 bg-brand-50 p-5">
        <p className="text-[13px] leading-relaxed text-brand-800">{intro}</p>
      </div>

      <div className="mt-10 space-y-8">
        {sections.map((section, index) => (
          <section key={section.heading}>
            <h2 className="flex items-baseline gap-3 font-display text-[16px] font-medium tracking-tight text-ink-950">
              <span
                data-numeric
                aria-hidden
                className="font-mono text-[12px] text-brand-500"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {section.heading}
            </h2>
            <p className="mt-2 pl-9 text-[14px] leading-relaxed text-ink-500">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
