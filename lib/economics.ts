/**
 * Unit economics for one SKU snapshot (GBP amounts on Amazon.co.uk; numbers only here).
 * Margin is revenue minus COGS minus estimated fees minus ad spend. Days of cover is
 * units on hand divided by average daily units.
 * A bleeder is an established SKU whose ads cost too much relative to attributed sales.
 * A launch is never a bleeder. This file does not look up Amazon fee schedules, talk
 * to a database, or ask a model to estimate the numbers.
 */

import type { DaysOfCover, Margin, SkuAssessment, SkuSnapshot } from "./types";

/** Reorder when days of cover are strictly under this. Fourteen days is two weeks of stock. */
export const REORDER_COVER_DAYS = 14;

/**
 * Ad cost of sale at or above this is a bleeder.
 * 0.5 means ads cost half of the sales they are credited with.
 */
export const BLEEDER_ACOS = 0.5;

export function margin(
  snapshot: Pick<SkuSnapshot, "revenue" | "cogs" | "estimatedFees" | "adSpend">,
): Margin {
  const amount =
    snapshot.revenue - snapshot.cogs - snapshot.estimatedFees - snapshot.adSpend;
  const rate = snapshot.revenue === 0 ? null : amount / snapshot.revenue;
  return { amount, rate };
}

export function daysOfCover(
  unitsOnHand: number,
  averageDailyUnits: number,
): DaysOfCover {
  if (averageDailyUnits === 0) {
    return { days: null, reorder: false };
  }
  const days = unitsOnHand / averageDailyUnits;
  return { days, reorder: days < REORDER_COVER_DAYS };
}

/** Null when there are no attributed sales. Spending with nothing attributed is not a ratio. */
export function advertisingCostOfSale(
  adSpend: number,
  attributedSales: number,
): number | null {
  if (attributedSales === 0) return null;
  return adSpend / attributedSales;
}

export function isBleeder(
  snapshot: Pick<SkuSnapshot, "stage" | "adSpend" | "attributedSales">,
): boolean {
  if (snapshot.stage === "launch") return false;
  if (snapshot.adSpend <= 0) return false;
  if (snapshot.attributedSales === 0) return true;
  return snapshot.adSpend / snapshot.attributedSales >= BLEEDER_ACOS;
}

export function assessSku(snapshot: SkuSnapshot): SkuAssessment {
  return {
    skuId: snapshot.id,
    margin: margin(snapshot),
    cover: daysOfCover(snapshot.unitsOnHand, snapshot.averageDailyUnits),
    acos: advertisingCostOfSale(snapshot.adSpend, snapshot.attributedSales),
    bleeder: isBleeder(snapshot),
    checklist: snapshot.stage === "launch",
  };
}
