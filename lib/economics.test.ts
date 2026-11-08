/**
 * Pins margin, days of cover, and the bleeder flag for the four seed SKUs, plus
 * the boundaries those stories do not hit. Calls the rule functions directly.
 * No database, no model, no HTTP.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assessSku } from "./economics";
import { bleeder, hero, launch, lowStock } from "./seed";
import type { SkuSnapshot } from "./types";

function snapshot(overrides: Partial<SkuSnapshot>): SkuSnapshot {
  return {
    ...hero,
    id: "sku-edge",
    sellerSku: "EDGE",
    name: "Edge case",
    ...overrides,
  };
}

describe("seed stories", () => {
  it("keeps Hero’s ASIN separate from the seller SKU and the margin amount at 500", () => {
    assert.equal(hero.sellerSku, "HERO-MUG-16");
    assert.equal(hero.asin, "B0HEROMUG1");
    assert.equal(assessSku(hero).margin.amount, 500);
  });

  it("keeps Hero profitable, stocked past two weeks, and under the ad limit", () => {
    const result = assessSku(hero);

    assert.equal(result.skuId, "sku-hero");
    assert.equal(result.margin.amount, 500);
    assert.equal(result.margin.rate, 0.25);
    assert.equal(result.cover.days, 28);
    assert.equal(result.cover.reorder, false);
    assert.equal(result.acos, 0.25);
    assert.equal(result.bleeder, false);
    assert.equal(result.checklist, false);
  });

  it("flags Low stock for reorder and leaves ads alone", () => {
    const result = assessSku(lowStock);

    assert.equal(result.margin.amount, 400);
    assert.equal(result.margin.rate, 0.4);
    assert.equal(result.cover.days, 5);
    assert.equal(result.cover.reorder, true);
    assert.equal(result.acos, 0.2);
    assert.equal(result.bleeder, false);
    assert.equal(result.checklist, false);
  });

  it("flags Bleeder on ads and does not ask for a reorder", () => {
    const result = assessSku(bleeder);

    assert.equal(result.margin.amount, -50);
    assert.equal(result.margin.rate, -0.1);
    assert.equal(result.cover.days, 40);
    assert.equal(result.cover.reorder, false);
    assert.equal(result.acos, 2);
    assert.equal(result.bleeder, true);
    assert.equal(result.checklist, false);
  });

  it("keeps Launch on the checklist with no cover figure and no bleeder flag", () => {
    const result = assessSku(launch);

    assert.equal(result.margin.amount, -80);
    assert.equal(result.margin.rate, null);
    assert.equal(result.cover.days, null);
    assert.equal(result.cover.reorder, false);
    assert.equal(result.acos, null);
    assert.equal(result.bleeder, false);
    assert.equal(result.checklist, true);
  });
});

describe("boundaries", () => {
  it("returns a margin amount and no rate when revenue is zero", () => {
    const result = assessSku(
      snapshot({
        revenue: 0,
        cogs: 0,
        estimatedFees: 0,
        adSpend: 25,
      }),
    );

    assert.equal(result.margin.amount, -25);
    assert.equal(result.margin.rate, null);
  });

  it("does not reorder at exactly 14 days of cover", () => {
    const result = assessSku(snapshot({ unitsOnHand: 14, averageDailyUnits: 1 }));

    assert.equal(result.cover.days, 14);
    assert.equal(result.cover.reorder, false);
  });

  it("reorders when cover is just under 14 days", () => {
    const result = assessSku(snapshot({ unitsOnHand: 13, averageDailyUnits: 1 }));

    assert.equal(result.cover.days, 13);
    assert.equal(result.cover.reorder, true);
  });

  it("has no days of cover when average daily units are zero", () => {
    const result = assessSku(
      snapshot({ stage: "established", unitsOnHand: 40, averageDailyUnits: 0 }),
    );

    assert.equal(result.cover.days, null);
    assert.equal(result.cover.reorder, false);
  });

  it("flags an established SKU that spent on ads and got no attributed sales", () => {
    const result = assessSku(
      snapshot({ stage: "established", adSpend: 40, attributedSales: 0 }),
    );

    assert.equal(result.acos, null);
    assert.equal(result.bleeder, true);
  });

  it("flags ad cost of sale of exactly one half", () => {
    const result = assessSku(
      snapshot({ stage: "established", adSpend: 50, attributedSales: 100 }),
    );

    assert.equal(result.acos, 0.5);
    assert.equal(result.bleeder, true);
  });

  it("does not flag ad cost of sale just under one half", () => {
    const result = assessSku(
      snapshot({ stage: "established", adSpend: 49, attributedSales: 100 }),
    );

    assert.equal(result.acos, 0.49);
    assert.equal(result.bleeder, false);
  });

  it("does not treat zero ad spend as a bleeder", () => {
    const result = assessSku(
      snapshot({ stage: "established", adSpend: 0, attributedSales: 0 }),
    );

    assert.equal(result.bleeder, false);
  });

  it("does not flag a launch SKU whose ads would fail the established test", () => {
    const result = assessSku(
      snapshot({
        stage: "launch",
        adSpend: 90,
        attributedSales: 10,
        averageDailyUnits: 0,
      }),
    );

    assert.equal(result.bleeder, false);
    assert.equal(result.checklist, true);
    assert.equal(result.cover.days, null);
  });
});
