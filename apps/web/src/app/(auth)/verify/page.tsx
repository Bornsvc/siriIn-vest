import type { Metadata } from "next";
import { connection } from "next/server";
import {
  VerifyFlow,
  fetchFundSources,
  fetchProvinces,
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
 * select fill itself in.
 */
export default async function VerifyPage() {
  // Stop prerendering here, before the fetch. Without it the build's attempt to
  // render this statically bails out by throwing, and that throw lands in the
  // catch below — where a failed API call is meant to be the only thing caught.
  await connection();

  let provinces: Province[] = [];
  let fundSources: FundSource[] = [];

  const [provincesResult, fundSourcesResult] = await Promise.allSettled([
    fetchProvinces(),
    fetchFundSources(),
  ]);

  if (provincesResult.status === "fulfilled") {
    provinces = provincesResult.value;
  } else {
    // Not fatal to the page: the other fields still work, and the step says
    // why this one does not. The reason belongs in the server log.
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
