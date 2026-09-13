import type { Metadata } from "next";
import { connection } from "next/server";
import {
  VerifyFlow,
  fetchFundSources,
  fetchProvinces,
  FALLBACK_FUND_SOURCES,
  FALLBACK_PROVINCES,
  type FundSource,
  type Province,
} from "@/features/auth";

export const metadata: Metadata = { title: "Verify your identity" };

/**
 * The flow owns its own heading: the terminal state is a different sentence
 * from the three steps that lead to it.
 *
 * The province and fund-source lists are fetched here rather than in the
 * flow so they are on the page at first paint — the customer never watches a
 * select fill itself in. If the API cannot be reached at all — demo mode, or
 * the API genuinely being down — the fallback snapshot keeps both selects
 * usable instead of showing "Unavailable".
 */
export default async function VerifyPage() {
  // Stop prerendering here, before the fetch. Without it the build's attempt to
  // render this statically bails out by throwing, and that throw lands in the
  // catch below — where a failed API call is meant to be the only thing caught.
  await connection();

  let provinces: Province[] = FALLBACK_PROVINCES;
  let fundSources: FundSource[] = FALLBACK_FUND_SOURCES;

  const [provincesResult, fundSourcesResult] = await Promise.allSettled([
    fetchProvinces(),
    fetchFundSources(),
  ]);

  if (provincesResult.status === "fulfilled") {
    provinces = provincesResult.value;
  } else {
    // Not fatal to the page: the fallback list still works, and the reason
    // belongs in the server log rather than in front of the customer.
    console.error("Could not load the province list.", provincesResult.reason);
  }

  if (fundSourcesResult.status === "fulfilled") {
    fundSources = fundSourcesResult.value;
  } else {
    console.error(
      "Could not load the fund-source list.",
      fundSourcesResult.reason,
    );
  }

  return <VerifyFlow provinces={provinces} fundSources={fundSources} />;
}
