# Merchant Desk

A small **UK FBA seller ops** project you build step by step. Mock catalog data stands in for Seller Central. **Code** works out margin, stock cover, and whether ads look wasteful. A **weekly brief and drafts** come later, with a human approving anything that would matter. Nothing here talks to Amazon.

Amounts are **GBP (£)** for **Amazon.co.uk**. See [MILESTONES.md](./MILESTONES.md) for the full plan. We do **one micro-step per session** and do not skip ahead.

## Where we are now

**Done:** M01–M03 — types, four demo SKUs (Hero, Low stock, Bleeder, Launch), and unit tests. No website, database, or OpenAI yet.

**Next:** M04 — seller SKU vs ASIN.

## Try it

```bash
npm install
npm test
```

Thirteen tests should pass. They pin the four demo stories.

## Four demo SKUs (snapshot date 2026-11-06)

| Story | What it teaches |
| --- | --- |
| Hero mug | Healthy margin and stock |
| Low stock bottle | Reorder when cover is under 14 days |
| Bleeder case | High ACOS — ads costing too much vs attributed sales |
| Launch lamp | New listing — checklist, not “bleeder” yet |

## Later (not built yet)

Dashboard, demo login, tools + chat brief, listing/PPC drafts, Supabase, deploy. Env vars will include things like `OPENAI_API_KEY`, `SUPABASE_URL`, `DEMO_PASSWORD`, and `SESSION_SECRET` when those milestones land.

## Safety

- Mock data only until you import real reports.
- Drafts stay drafts until you approve them; **apply does not change Seller Central** (stub).
