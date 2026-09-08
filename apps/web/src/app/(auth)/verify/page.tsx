import type { Metadata } from "next";
import { connection } from "next/server";
import { VerifyFlow, fetchProvinces, type Province } from "@/features/auth";

export const metadata: Metadata = { title: "Verify your identity" };

/**
 * The flow owns its own heading: the terminal state is a different sentence
 * from the three steps that lead to it.
 *
 * The province list is fetched here rather than in the flow so it is on the
 * page at first paint — the customer never watches a select fill itself in.
 */
export default async function VerifyPage() {
  // Stop prerendering here, before the fetch. Without it the build's attempt to
  // render this statically bails out by throwing, and that throw lands in the
  // catch below — where a failed API call is meant to be the only thing caught.
  await connection();

  let provinces: Province[] = [];

  try {
    provinces = await fetchProvinces();
  } catch (error) {
    // Not fatal to the page: the other four fields still work, and the step
    // says why the fifth does not. The reason belongs in the server log.
    console.error("Could not load the province list.", error);
  }

  return <VerifyFlow provinces={provinces} />;
}
