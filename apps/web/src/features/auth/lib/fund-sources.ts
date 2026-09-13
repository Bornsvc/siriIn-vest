import { apiGet } from "@/shared/lib/api";

export type FundSource = {
  code: string;
  label: string;
};

/**
 * The six reasons a check has to give, from the API and already in the
 * order to display them — salary first because it is the common answer, not
 * because of the alphabet, so this must never be re-sorted.
 */
export async function fetchFundSources(): Promise<FundSource[]> {
  const { fundSources } = await apiGet<{ fundSources: FundSource[] }>(
    "/fund-sources",
  );
  return fundSources;
}

/** A snapshot of the database's own answer — see `FALLBACK_PROVINCES`. */
export const FALLBACK_FUND_SOURCES: FundSource[] = [
  { code: "salary", label: "Salary or wages" },
  { code: "business", label: "Business income" },
  { code: "savings", label: "Savings" },
  { code: "investments", label: "Returns on other investments" },
  { code: "family", label: "Family support or gift" },
  { code: "inheritance", label: "Inheritance" },
];
