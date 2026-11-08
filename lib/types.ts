/**
 * Shared shapes for one SKU snapshot and the economics result the rules return.
 * Money fields are GBP amounts for a UK FBA seller (Amazon.co.uk). The types store
 * plain numbers; formatting with £ is for UI and docs later. This file does not
 * calculate anything, read a database, or call a model.
 */

/** Established SKUs are judged on margin, cover, and ads. A launch is checklist-only. */
export type SkuStage = "established" | "launch";

export type SkuSnapshot = {
  id: string;
  sellerSku: string;
  name: string;
  stage: SkuStage;
  /** Product sales in the snapshot window, in GBP (ordered product sales). */
  revenue: number;
  /** What the sold units cost to buy or make. */
  cogs: number;
  /** Referral plus FBA fulfillment estimate for those units. An input, not a live fee quote. */
  estimatedFees: number;
  /** Sponsored Products spend in the same window. */
  adSpend: number;
  /** Sales Amazon attributed to that ad spend. */
  attributedSales: number;
  unitsOnHand: number;
  /** Mean units sold per day. Zero means there is no velocity to divide by. */
  averageDailyUnits: number;
};

export type Margin = {
  amount: number;
  /** Null when revenue is zero. A rate needs a denominator. */
  rate: number | null;
};

export type DaysOfCover = {
  /** Null when average daily units are zero. */
  days: number | null;
  reorder: boolean;
};

export type SkuAssessment = {
  skuId: string;
  margin: Margin;
  cover: DaysOfCover;
  /** Ad spend divided by attributed sales. Null when attributed sales are zero. */
  acos: number | null;
  bleeder: boolean;
  /** True for a launch SKU. Checklist mode, not the established-SKU flags. */
  checklist: boolean;
};
