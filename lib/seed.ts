/**
 * Four fictional FBA SKUs used by the economics tests. Hero is healthy. Low stock
 * needs a reorder. Bleeder spends too much on ads for the sales those ads get.
 * Launch is new and stays on a checklist. Figures are a snapshot as of STORY_TODAY.
 * Amounts are mock GBP for Amazon.co.uk. This file does not compute margin or flags
 * — lib/economics.ts does that.
 */

import type { SkuSnapshot } from "./types";

/** UK marketplace demo currency. Economics code uses unitless numbers. */
export const DEMO_CURRENCY = "GBP" as const;

export const STORY_TODAY = "2026-11-06";

/** Healthy sales, about four weeks of stock, ads at a quarter of attributed sales. */
export const hero: SkuSnapshot = {
  id: "sku-hero",
  sellerSku: "HERO-MUG-16",
  name: "Insulated travel mug 16oz",
  stage: "established",
  revenue: 2000,
  cogs: 800,
  estimatedFees: 500,
  adSpend: 200,
  attributedSales: 800,
  unitsOnHand: 280,
  averageDailyUnits: 10,
};

/** Still profitable and ads are fine. Five days of stock, under the 14-day line. */
export const lowStock: SkuSnapshot = {
  id: "sku-low-stock",
  sellerSku: "LOW-BOTTLE-24",
  name: "Stainless bottle 24oz",
  stage: "established",
  revenue: 1000,
  cogs: 300,
  estimatedFees: 200,
  adSpend: 100,
  attributedSales: 500,
  unitsOnHand: 10,
  averageDailyUnits: 2,
};

/** Plenty of stock. Ads cost twice the sales they are credited with, and margin is negative. */
export const bleeder: SkuSnapshot = {
  id: "sku-bleeder",
  sellerSku: "BLEED-CASE-13",
  name: "Phone case clear",
  stage: "established",
  revenue: 500,
  cogs: 150,
  estimatedFees: 100,
  adSpend: 300,
  attributedSales: 150,
  unitsOnHand: 80,
  averageDailyUnits: 2,
};

/**
 * New listing. Some ad spend, no sales, no daily velocity.
 * Those inputs would look like a bleeder on an established SKU. Stage keeps it off that flag.
 */
export const launch: SkuSnapshot = {
  id: "sku-launch",
  sellerSku: "NEW-LAMP-07",
  name: "Desk lamp clip",
  stage: "launch",
  revenue: 0,
  cogs: 0,
  estimatedFees: 0,
  adSpend: 80,
  attributedSales: 0,
  unitsOnHand: 120,
  averageDailyUnits: 0,
};

export const seedSkus: SkuSnapshot[] = [hero, lowStock, bleeder, launch];
