/** The kip⇄dollar rate as one moment in time. */
export interface FxRateView {
  id: string;
  /** How many kip one U.S. dollar buys. A decimal string, never a JSON number. */
  usdLak: string;
  source: string;
  observedAt: string;
}
