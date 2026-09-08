/** Laos' first-level divisions: 17 provinces and the capital prefecture. */
export type ProvinceKind = 'prefecture' | 'province';

export interface Province {
  /** What a record stores. Stable, and independent of romanization. */
  code: string;
  /** What a customer reads. */
  name: string;
  kind: ProvinceKind;
}

export interface ProvinceList {
  provinces: Province[];
}
