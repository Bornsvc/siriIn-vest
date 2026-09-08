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
