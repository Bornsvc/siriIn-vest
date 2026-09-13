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

/**
 * A snapshot of the database's own answer, for the one moment this page
 * cannot reach it — demo mode, or the API genuinely being down. Kept in step
 * with the migration that seeds `provinces`; if that ever changes, this is
 * stale until someone updates it, which is the correct failure mode for a
 * fallback that exists to be rare.
 */
export const FALLBACK_PROVINCES: Province[] = [
  { code: "attapeu", name: "Attapeu", kind: "province" },
  { code: "bokeo", name: "Bokeo", kind: "province" },
  { code: "bolikhamsai", name: "Bolikhamsai", kind: "province" },
  { code: "champasak", name: "Champasak", kind: "province" },
  { code: "houaphanh", name: "Houaphanh", kind: "province" },
  { code: "khammouane", name: "Khammouane", kind: "province" },
  { code: "luang-namtha", name: "Luang Namtha", kind: "province" },
  { code: "luang-prabang", name: "Luang Prabang", kind: "province" },
  { code: "oudomxay", name: "Oudomxay", kind: "province" },
  { code: "phongsaly", name: "Phongsaly", kind: "province" },
  { code: "sainyabuli", name: "Sainyabuli", kind: "province" },
  { code: "salavan", name: "Salavan", kind: "province" },
  { code: "savannakhet", name: "Savannakhet", kind: "province" },
  { code: "sekong", name: "Sekong", kind: "province" },
  { code: "vientiane-prefecture", name: "Vientiane Prefecture", kind: "prefecture" },
  { code: "vientiane-province", name: "Vientiane Province", kind: "province" },
  { code: "xaisomboun", name: "Xaisomboun", kind: "province" },
  { code: "xieng-khouang", name: "Xieng Khouang", kind: "province" },
];
