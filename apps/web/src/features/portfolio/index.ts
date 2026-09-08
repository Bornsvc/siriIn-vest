export { PortfolioValueCard } from "./components/value-card";
export { PortfolioTabs } from "./components/portfolio-tabs";
export { HoldingsPanel } from "./components/holdings-panel";
export { PerformancePanel } from "./components/performance-panel";
export { HistoryPanel } from "./components/history-panel";

export {
  buildPerformance,
  buildRangeSeries,
  buildValueSplit,
  groupByMonth,
  toOrderRows,
} from "./lib/analytics";

export type {
  AllocationSlice,
  Contribution,
  OrderMonth,
  OrderRow,
  PerformanceData,
  RangeSeries,
  ValueSplit,
} from "./lib/analytics";
