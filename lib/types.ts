/**
 * Shared shapes for one SKU snapshot and the economics result the rules return.
 * Money fields are GBP amounts for a UK FBA seller (Amazon.co.uk). The types store
 * plain numbers; formatting with £ is for UI and docs later. This file does not
 * calculate anything, read a database, or call a model.
 */

/** Established SKUs are judged on margin, cover, and ads. A launch is checklist-only. */
export type SkuStage = "established" | "launch";

/**
 * One SKU on one date (or one report week): the inputs `lib/economics.ts` needs.
 * Everything below is already a number you looked up or typed in — not a formula.
 */
export type SkuSnapshot = {
  // --- Who is this product? ---
  // Stable id used in tests, seed data, and (later) the database — not what you print on a label.
  id: string;
  // Your offer code in Seller Central (what you put on the FBA label workflow).
  sellerSku: string;
  // Amazon’s catalog page id. Not the same as sellerSku: that is our offer code, this is Amazon’s product page. Economics stay keyed by id / seller SKU.
  asin: string;
  // Plain English product name for the dashboard.
  name: string;
  // "launch" = new listing, checklist only. "established" = normal margin, stock, and ad flags.
  stage: SkuStage;
  // --- Sales in the snapshot window (e.g. last 7 days on the Business Report) ---
  // Ordered product sales in £: what shoppers paid for units sold in that window (Business Report).
  revenue: number;
  // COGS in £: what those sold units cost you to buy or make — Amazon does not report this; you supply it.
  cogs: number;
  // Estimated Amazon selling fees in £ for those units (referral + FBA fulfilment lumped together until M05 splits them).
  estimatedFees: number;
  // --- Sponsored Products in the same window (advertised product report) ---
  // Ad spend in £: what you paid for clicks on this SKU’s ads in that period.
  adSpend: number;
  // Attributed sales in £: product sales Amazon credits to those ads (not the same as total revenue).
  attributedSales: number;
  // --- Stock and velocity (inventory + Business Report) ---
  // Fulfillable units in FBA on the snapshot date — available to ship to a customer today.
  unitsOnHand: number;
  // Average units sold per day in the window (units ordered ÷ number of days). Zero means no sales pace to measure.
  averageDailyUnits: number;
};

/** Profit after COGS, fees, and ads. `rate` is margin amount ÷ revenue when revenue is not zero. */
export type Margin = {
  // Margin in £ for the window: revenue − COGS − estimated fees − ad spend.
  amount: number;
  // Share of revenue kept as margin (e.g. 0.25 = 25%). Null when revenue was £0 — nothing to divide by.
  rate: number | null;
};

/** How long current stock might last at today’s sales pace, and whether to reorder. */
export type DaysOfCover = {
  // Estimated days until stock runs out at average daily units. Null when average daily units is zero.
  days: number | null;
  // True when days of cover is below the reorder threshold (14 in `lib/economics.ts`).
  reorder: boolean;
};

/** Output of `assessSku`: margin, stock, ads, and the flags the dashboard and brief will show. */
export type SkuAssessment = {
  // Same id as the snapshot you passed in.
  skuId: string;
  // Profit and margin rate for the window.
  margin: Margin;
  // Stock runway and reorder flag.
  cover: DaysOfCover;
  // ACOS: ad spend ÷ attributed sales. Null when attributed sales were £0.
  acos: number | null;
  // True when an established SKU’s ads look too expensive (see `isBleeder` in economics).
  bleeder: boolean;
  // True for a launch SKU — show a checklist instead of treating it like a mature bleeder.
  checklist: boolean;
};
