import type { Stock } from "@/shared/types";
import { Card, CardBody, CardHeader } from "@/shared/ui";

/**
 * English first because that is the language the filings are written in, Lao
 * underneath because that is the language the decision is made in.
 */
export function AboutStock({ stock }: { stock: Stock }) {
  return (
    <Card>
      <CardHeader eyebrow="ກ່ຽວກັບບໍລິສັດ" title={`About ${stock.name}`} />
      <CardBody className="space-y-3.5">
        <p className="text-[13.5px] leading-relaxed text-ink-700">
          {stock.about}
        </p>
        <p className="lao border-t border-line pt-3.5 text-[13px] text-ink-500">
          {stock.aboutLo}
        </p>
      </CardBody>
    </Card>
  );
}
