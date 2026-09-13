/**
 * Real sign-up, sign-in and identity verification all need a live API, a
 * database and a storage bucket. Until those are deployed somewhere a
 * customer can reach, this flag lets the whole product be clicked through on
 * the frontend alone — the same screens and the same flows, with nothing
 * real behind them: any email and password gets in, and a KYC submission is
 * accepted instantly rather than reviewed.
 *
 * Defaults to on, so a plain deploy of this app is a working demo without
 * anyone having to remember to set anything. Once the backend is reachable,
 * set `NEXT_PUBLIC_DEMO_MODE=false` and every screen goes back to calling it
 * for real — nothing else about them changes.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
