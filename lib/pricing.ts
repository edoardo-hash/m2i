// lib/pricing.ts
export const toNum = (x: unknown): number =>
  typeof x === "string"
    ? Number(String(x).replace(/[^\d.]/g, ""))
    : typeof x === "number"
    ? x
    : NaN;

export const eur0 = (n: number): string =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

export type PriceBag = {
  winter?: number | string;
  summer?: number | string;
  annual?: number | string;
  yearly?: number | string;
};

export const pickPriceBag = (v: any): PriceBag =>
  (v?.price ||
    v?.pricing ||
    v?.meta?.prices ||
    v?.rent ||
    {}) as PriceBag;

export const availability = (v: any) => {
  const p = pickPriceBag(v);
  const winter = toNum((p as any).winter);
  const summer = toNum((p as any).summer);
  const annual = toNum((p as any).annual ?? (p as any).yearly ?? (v?.priceAnnual ?? v?.yearly));
  return {
    hasWinter: Number.isFinite(winter) && winter > 0,
    hasSummer: Number.isFinite(summer) && summer > 0,
    hasAnnual: Number.isFinite(annual) && annual > 0,
    winter,
    summer,
    annual,
  };
};

export const monthlyFromVilla = (v: any): number | undefined => {
  const { winter, summer, annual } = availability(v);
  const monthlies: number[] = [];
  if (Number.isFinite(winter) && winter! > 0) monthlies.push((winter as number) / 6);
  if (Number.isFinite(summer) && summer! > 0) monthlies.push((summer as number) / 6);
  if (Number.isFinite(annual) && annual! > 0) monthlies.push((annual as number) / 12);
  return monthlies.length ? Math.min(...monthlies) : undefined;
};