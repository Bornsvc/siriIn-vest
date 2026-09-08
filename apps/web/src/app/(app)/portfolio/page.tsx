import { getOrdersFor, getPortfolioSummary } from "@/mock/selectors";
import {
  buildPerformance,
  buildRangeSeries,
  HistoryPanel,
  HoldingsPanel,
  PerformancePanel,
  PortfolioTabs,
  PortfolioValueCard,
  toOrderRows,
} from "@/features/portfolio";
import { PageHeader } from "@/features/shell";

/**
 * Server component: every figure is derived here and handed down, so the only
 * JavaScript that reaches the browser is the chart cursor, the table sort and
 * the history filters.
 */
export default function PortfolioPage() {
  const summary = getPortfolioSummary();
  const series = buildRangeSeries();
  const performance = buildPerformance(summary);
  const orders = toOrderRows(getOrdersFor());

  return (
    <>
      <PageHeader
        eyebrow="ພອດໂຟລິໂອ"
        title="Portfolio"
        description="Everything you hold, what it is worth in dollars and in kip, and every order behind it."
      />

      <PortfolioValueCard summary={summary} series={series} />

      <PortfolioTabs
        holdingsCount={summary.positions.length}
        historyCount={orders.length}
        holdings={<HoldingsPanel positions={summary.positions} />}
        performance={<PerformancePanel data={performance} />}
        history={<HistoryPanel rows={orders} />}
      />
    </>
  );
}
