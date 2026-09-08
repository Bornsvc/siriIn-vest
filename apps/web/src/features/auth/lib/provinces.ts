import { apiGet } from "@/shared/lib/api";

export type Province = {
  /** What the record stores: a slug, stable across spellings. */
  code: string;
  /** What the customer reads. */
  name: string;
  kind: "prefecture" | "province";
};

/**
 * The 17 provinces and the capital prefecture, from the API.
 *
 * This list used to be a constant in `verify.ts`, which meant the form and the
 * database each had their own idea of how to spell a Lao province. The
 * database is the list now, so a customer's record cannot disagree with the
 * select they picked from.
 */
export async function fetchProvinces(): Promise<Province[]> {
  const { provinces } = await apiGet<{ provinces: Province[] }>("/provinces");
  return provinces;
}
