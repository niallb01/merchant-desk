# Merchant Desk — incremental build

**Repo:** `merchant-desk` — https://github.com/niallb01/merchant-desk.git

## How we work (read this every session)

1. **One micro-step per session.** A letter suffix (`M14a`) is still one session. Do not do the next id in the same sitting.
2. **Do not skip.** If M17 is not done, we do not start the dashboard data route.
3. **Concept first.** Each step adds one idea you can explain in one sentence.
4. **Shared brain.** Business logic stays in `lib/`. Margin, days of cover, ACOS, TACOS, break-even ACOS, and “this search term is a negative candidate” are not copied into SQL, the UI, or the system prompt.
5. **Safety line.** Nothing in this project is sent to Amazon. Nothing changes a bid, a price, or a listing. A draft stays a draft until a person marks it approved. Approved still does not mean Seller Central changed. Apply is a stub that says so.
6. **The database holds facts.** Sales, fulfillable units, ad spend, and drafts are rows. Postgres does not decide reorder or bleeder. The TypeScript rules do.
7. **A button is not authorisation.** From M17, protected routes check an HttpOnly session cookie set by a server-side demo login. Browser JavaScript never sees the demo password or the session value. The model cannot mark a draft approved.
8. **Dev wire logs (browser ↔ route).** When a milestone connects UI to an `app/api/…` handler, add short logs gated on `NODE_ENV === "development"`: in the client component, log the method/URL and JSON body before `fetch`, then log response status and body after; in the route handler, log what was received and what is returned (or passed to `lib/`). Browser DevTools shows the client lines; the `next dev` terminal shows the server line.

**What we’re building:** One seller workspace. Four mock FBA SKUs. The model reads metrics through tools and drafts text. Code owns the arithmetic and the risk flags. A human approves before anything would matter.

**Stack (fixed):** Next.js (App Router) + TypeScript, CSS Modules, Supabase Postgres, OpenAI from the server only, one shared tool layer, Vercel. No LangGraph, CrewAI, n8n, or a second backend. No SP-API and no pgvector in this numbered list.

**Currency and marketplace:** UK-based FBA on **Amazon.co.uk**. Mock figures and UI copy use **pounds sterling (GBP, £)**. Seller Central report names stay Amazon’s (e.g. Ordered Product Sales). TypeScript stores plain numbers with no currency field until a milestone needs display formatting. Do not mix in US-dollar examples in docs, seeds, or prompts unless a step explicitly compares marketplaces.

The first sitting built M01, M02, and M03 together. They are written below as three steps so each idea stays one sentence. That is not permission to combine later steps.

---

## Project layout (create folders when a milestone needs them)

Do not scaffold empty trees ahead of time. Each micro-step adds only the paths it lists.

**Target shape** (most of this appears from M08 onward):

```text
app/                      # Next.js routes, layouts, API handlers (thin — call lib/)
components/               # UI: dashboard, login, brief, drafts
lib/                      # Economics, tools, DB services (shared brain)
  economics.ts
  economics.test.ts       # unit tests live next to the module they test
supabase/                 # config.toml, migrations/, seed (M08+)
tests/
  integration/            # DB read tests, when a milestone needs them
  evals/                  # Small behaviour checks (M37)
```

| Area | Rule |
| --- | --- |
| **`lib/`** | Economics, negative-candidate rule, tool dispatcher, Supabase read/write services. Routes and components call in; they do not duplicate rules. |
| **`app/`** | HTTP only: pages, layouts, route handlers. Handlers validate session (M17), then delegate to `lib/`. |
| **`components/`** | Presentation. No second copy of margin, cover, or ACOS. |
| **Unit tests** | Colocate as `*.test.ts` beside the file under `lib/`. |
| **Integration tests** | `tests/integration/` when a step needs Postgres. Not mirrored under every `lib/` file. |
| **Evals** | `tests/evals/` at M37. Earlier checkpoints are the “you run” lines, not a scorecard. |
| **State** | No top-level `state/` folder. Server truth is Postgres. Session is an HttpOnly cookie (M17). The workspace uses React state until the same logic is needed in two places. |
| **File headers** | Each new code file under `lib/`, `app/`, and `components/` starts with one plain-English paragraph (block comment) saying what the file does and what it deliberately does not do. |

**When folders first appear**

| Folder | First milestone |
| --- | --- |
| `lib/` | M01 (exists) |
| `supabase/` | M08 |
| `supabase/migrations/` | M09 |
| `app/` | M15 |
| `components/` | M16 (M17 adds the login form as needed) |
| `tests/integration/` | M14, if the read-path check needs Postgres |
| `tests/evals/` | M37 |

---

## Phases (map only — you execute micro-steps)

| Phase | Topic | Micro-steps |
| --- | --- | --- |
| A | Margin, cover, and the ad flag in pure code | M01–M03 ✅ |
| B | Seller identity, the two Amazon fees, TACOS, break-even | M04–M07 |
| C | Postgres stores report-shaped facts | M08–M14 |
| D | Workspace UI (no model yet) | M15–M18 (login is M17, before any data route) |
| E | Agent tool loop, one tool at a time, then the weekly brief | M19–M27 |
| F | Drafts a person can approve | M28–M33 |
| G | Audit and token counts | M34–M36 |
| H | Small eval scorecard | M37 |
| I | README and deploy | M38 |

CSV import and SP-API stay off this list until M38 is done. They get their own numbers then, still one report shape at a time.

---

## Progress

| Step | Status |
| --- | --- |
| M01 | **Done** |
| M02 | **Done** |
| M03 | **Done** |
| M04 | Not started |
| M05 | Not started |
| M06 | Not started |
| M07 | Not started |
| M08 | Not started |
| M09 | Not started |
| M10 | Not started |
| M11 | Not started |
| M12 | Not started |
| M13 | Not started |
| M14 | Not started |
| M15 | Not started |
| M16 | Not started |
| M17 | Not started |
| M18 | Not started |
| M19 | Not started |
| M20 | Not started |
| M21 | Not started |
| M22 | Not started |
| M23 | Not started |
| M24 | Not started |
| M25 | Not started |
| M26 | Not started |
| M27 | Not started |
| M28 | Not started |
| M29 | Not started |
| M30 | Not started |
| M31 | Not started |
| M32 | Not started |
| M33 | Not started |
| M34 | Not started |
| M35 | Not started |
| M36 | Not started |
| M37 | Not started |
| M38 | Not started |

---

## Phase A — Unit economics (no database, no UI, no model)

These three shipped in one sitting. Read them as three ideas. `npm test` covers all of them.

### M01 — Margin amount and rate ✅

**Concept:** Profit after product cost, Amazon fees, and ads is a function, not an AI opinion.

**What exists:** `margin` in `lib/economics.ts`. `Margin` on `lib/types.ts`. Hero, Low stock, Bleeder, and Launch GBP inputs in `lib/seed.ts`.

**You run:**

```bash
npm test
```

**You should understand:**

- Revenue here is ordered product sales: what shoppers paid for the units in the window.
- COGS is yours. Amazon does not know what you paid the supplier.
- Estimated fees are one number for now. Splitting referral and fulfillment is M05.
- Margin amount = revenue − COGS − estimated fees − ad spend. Hero is 2000 − 800 − 500 − 200 = **£500**. The rate is amount ÷ revenue = **0.25**.
- Zero revenue still has an amount (Launch is **−£80**, the ad spend) and **no rate**. A rate needs a denominator.
- The snapshot date is **2026-11-06**. The function does not read the clock.

**Not in this step:** Days of cover, ACOS, Supabase, Next.js, OpenAI.

**Done:** `margin` returns `{ amount, rate }`. Tests pin Hero at £500 and 0.25, and a zero-revenue snapshot at amount −25 with a null rate.

---

### M02 — Days of cover and the reorder line ✅

**Concept:** Days of cover is fulfillable units divided by how fast the SKU sells. Under 14 days raises reorder.

**What exists:** `daysOfCover` and `REORDER_COVER_DAYS` in `lib/economics.ts`.

**You run:** `npm test`

**You should understand:**

- Days of cover = units on hand ÷ average daily units. Low stock is 10 ÷ 2 = **5 days**, so reorder is true. Hero is 280 ÷ 10 = **28 days**, so reorder is false.
- **14 is our demo line, not an Amazon rule.** Real reorder timing follows supplier lead time: factory, freight, and Amazon check-in. Ocean freight is often well past 14 days. We use 14 so the Low stock story is obvious.
- Exactly 14 days does **not** reorder. 13 does.
- Zero average daily units means there is no velocity to divide by. Days is null and reorder stays false. A new listing with stock in the warehouse is not “out of stock.”

**Not in this step:** ACOS, a live inventory report, inbound or reserved units.

**Done:** Tests pin 14 days as not a reorder, 13 days as a reorder, and zero daily units as no cover figure.

---

### M03 — ACOS, the bleeder flag, and launch ✅

**Concept:** ACOS says whether ads are expensive relative to the sales Amazon credited to those ads. A launch is not judged that way.

**What exists:** `advertisingCostOfSale`, `isBleeder`, `BLEEDER_ACOS`, and `assessSku` in `lib/economics.ts`. The four named stories in `lib/seed.ts`.

**You run:** `npm test`

**You should understand:**

- ACOS (advertising cost of sale) = ad spend ÷ attributed sales. Attributed sales are orders Amazon credits to an ad click inside the campaign’s attribution window. They are not all of your revenue.
- Hero is 200 ÷ 800 = **0.25**. Low stock is 100 ÷ 500 = **0.20**. Bleeder is 300 ÷ 150 = **2** (you spent £2 in ads per £1 of ad-credited sales).
- An established SKU is a bleeder when ACOS is **at or above 0.50**, or when it spent money and attributed sales are zero (there is no ratio). Zero spend is not a bleeder.
- **0.50 is a fixed demo line.** It is not your break-even. Break-even ACOS is M07.
- Launch stays on a checklist (`checklist: true`) even if the same ad inputs would flag an established SKU. A new listing does not have enough history for ACOS to mean “pause it.”
- `assessSku` only calls the functions above. It does not invent a second set of rules.

**Not in this step:** TACOS, Supabase, a model writing the brief.

**Done:** Story tests: Hero trips nothing. Low stock trips reorder only. Bleeder trips the ad flag only and does not reorder (40 days of cover, margin **−£50**). Launch has null ACOS, bleeder false, checklist true. Boundary tests pin ACOS 0.50, ACOS 0.49, spend with no attributed sales, and a launch that would fail the established test.

---

## Phase B — One more seller idea at a time (still no database)

### M04 — Seller SKU and ASIN

**Concept:** You have an id for your offer. Amazon has an id for the catalog page. They are not the same field.

**Adds:** `asin` on `SkuSnapshot` and on the four seed stories. One test that Hero’s ASIN is the value below and that Hero’s margin amount is still 500.

**You run:** `npm test`

**You should understand:**

- Seller SKU is yours. Hero’s is `HERO-MUG-16`. You print it on labels and you see it in reports.
- ASIN is Amazon’s catalog id for the product page. Ten characters, usually starting with `B0`.
- One ASIN can have many seller SKUs (your single, your multipack, another seller’s offer). Economics in this app stay keyed by our SKU id.
- FNSKU is a third code: the barcode Amazon uses inside the fulfillment network. We do not store it in this step.
- Seed ASINs, fake on purpose: Hero `B0HEROMUG1`, Low stock `B0LOWBTL24`, Bleeder `B0BLEEDC13`, Launch `B0NEWLAMP07`.

**Not in this step:** Fees split, database, any call to Amazon.

---

### M05 — Referral fee and FBA fulfillment fee

**Concept:** “Amazon fees” are at least two different charges. Margin adds both. The Hero total does not change.

**Adds:** Replace `estimatedFees` with `referralFee` and `fbaFulfillmentFee`. `margin` subtracts both. Seed totals stay the same, split as below. Tests still expect Hero’s margin amount of 500.

**You run:** `npm test`

**You should understand:**

- The referral fee is Amazon’s commission, a percentage of the product sales, set by category. A lot of home and kitchen categories on **Amazon.co.uk** are 15%. Hero’s referral is 0.15 × 2000 = **£300**.
- The FBA fulfillment fee is per unit, from the size tier and the shipping weight. It is pick, pack, and ship. Hero’s fulfillment total for the window is **£200** (UK fee tiers apply in real life; these are mock inputs).
- Storage, aged-inventory surcharges, inbound placement, and return processing are real fees. They are not in this subtraction yet.
- These two numbers are still inputs you pass in. This step does not look up a fee schedule or a size tier.
- Seed split (referral + fulfillment = the old estimated fee): Low stock 150 + 50, Bleeder 75 + 25, Launch 0 + 0.

**Not in this step:** TACOS, settlement-report import, Next.js.

---

### M06 — TACOS next to ACOS

**Concept:** TACOS measures ad spend against all sales. ACOS measures it against ad-credited sales only.

**Adds:** `tacos` on `SkuAssessment`, null when revenue is 0. `assessSku` fills it. The bleeder rule does not change. Tests pin the four stories.

**You run:** `npm test`

**You should understand:**

- TACOS (total advertising cost of sale) = ad spend ÷ revenue.
- Hero’s ACOS is 0.25 (200 ÷ 800) and Hero’s TACOS is **0.10** (200 ÷ 2000). Most of Hero’s sales were not credited to ads. A healthy ACOS can sit beside a much smaller TACOS.
- Bleeder’s TACOS is 300 ÷ 500 = **0.60**. Low stock’s is 100 ÷ 1000 = **0.10**. Launch’s is null because revenue is 0.
- TACOS does not raise the bleeder flag in this step. The flag stays ACOS.

**Not in this step:** Break-even ACOS, a database column per metric.

---

### M07 — Break-even ACOS, shown and not yet the flag

**Concept:** The ACOS you can afford is your profit margin before ads. We calculate it. We do not quietly replace the 0.50 flag.

**Adds:** `breakEvenAcos` on `SkuAssessment`. Null when revenue is 0. Formula: (revenue − COGS − referral fee − fulfillment fee) ÷ revenue. Tests pin Hero at 0.35. `BLEEDER_ACOS` stays 0.50.

**You run:** `npm test`

**You should understand:**

- Pre-ad margin is what is left after the product and Amazon’s selling fees, before you pay for the click.
- Hero: (2000 − 800 − 300 − 200) ÷ 2000 = 700 ÷ 2000 = **0.35**. If an ad-attributed pound costs more than 35p in ads, that pound does not pay for itself. Hero’s actual ACOS is 0.25, under that line.
- Bleeder’s break-even is (500 − 150 − 75 − 25) ÷ 500 = **0.50**, and its ACOS is 2. The fixed flag and the break-even happen to match on this SKU. That is a coincidence. The flag is still the constant.
- This ignores halo sales (ads that also lift organic orders). It is the usual seller back-of-envelope, not a full P&L.

**Not in this step:** Changing `isBleeder` to use break-even, Supabase, a brief.

---

## Phase C — Postgres stores report-shaped facts

Code from Phase A and B still decides the flags. SQL stores the inputs.

### M08 — Supabase in the repo (config only)

**Concept:** Migrations will be versioned SQL. The app will not keep its source of truth in `lib/seed.ts` forever.

**Adds:** `supabase/config.toml`, plus a short note of the CLI workflow (`supabase init` / link or `supabase start`).

**You run:** `supabase --version`, then `supabase init` (or confirm the CLI and the project link).

**You should understand:** Seller Central is a pile of separate reports. Postgres will hold those shapes. `lib/economics.ts` stays the place that turns a snapshot into margin, cover, and flags.

**Not in this step:** Tables, seed rows, Next.js.

---

### M09 — Table: `skus`

**Concept:** The catalog row is identity only. It does not contain this week’s sales.

**Adds:** One migration. Columns: id, seller_sku, asin, name, stage (`established` or `launch`).

**You run:** Apply the migration. The table exists and is empty.

**You should understand:** In Seller Central the SKU is your offer and the ASIN is the catalog page. A sales figure does not belong on this row. It changes every report period. Stage is how we know Launch is checklist-only. SQL has no margin formula.

**Not in this step:** Sales, inventory, ads, seed rows.

---

### M10 — Table: `sales_periods`

**Concept:** One row is one SKU for one date window, shaped like a Business Report plus the costs Amazon does not report.

**Adds:** Migration. Columns include sku id, period start, period end, units ordered, ordered product sales, COGS, referral fee, FBA fulfillment fee. Foreign key to `skus`.

**You run:** Apply the migration. Describe one row in a sentence: “units and GBP sales for this SKU between these dates.”

**You should understand:**

- Business Reports call the money **Ordered Product Sales** and the count **Units Ordered**. That is our revenue and our units.
- COGS, referral, and fulfillment are columns you fill. A Business Report download does not include your supplier cost.
- The demo window is **2026-10-31 through 2026-11-06** inclusive (7 days), ending on `STORY_TODAY`.

**Not in this step:** Sessions, conversion rate, inventory, seed numbers.

---

### M11 — Table: `inventory_snapshots`

**Concept:** Days of cover needs fulfillable units on a date. Other warehouse buckets exist and are not this column.

**Adds:** Migration. Columns: sku id, as_of date, fulfillable units. Foreign key to `skus`.

**You run:** Apply the migration. The table exists and is empty.

**You should understand:**

- Fulfillable (Seller Central often shows this as Available) can be shipped against a new order.
- Inbound is on the way or being received. Reserved includes units held for a customer order or a transfer between fulfillment centers. Unsellable is damaged or stranded. Those are real balances. This table does not store them yet, so days of cover uses only fulfillable units.
- `as_of` for the demo is 2026-11-06.

**Not in this step:** A restock-limit API, seed rows, the days-of-cover formula in SQL.

---

### M12 — Table: `ad_periods`

**Concept:** Ad spend and attributed sales come from the ads report, not from the Business Report.

**Adds:** Migration. Columns: sku id, period start, period end, spend, attributed sales. Same dates as the sales window. Foreign key to `skus`.

**You run:** Apply the migration. The table exists and is empty.

**You should understand:** This is the Sponsored Products advertised-product report: one advertised SKU, its spend, and the sales Amazon attributed to it. The search-term report (the queries shoppers typed) is a different file. Negatives wait until M30.

**Not in this step:** Campaigns, keywords, search terms, seed rows.

---

### M13 — Seed the four stories

**Concept:** The same four SKUs as `lib/seed.ts`. Their meaning does not change.

**Adds:** Seed SQL for `sku-hero`, `sku-low-stock`, `sku-bleeder`, `sku-launch`, one sales period each, one inventory snapshot each, one ad period each. Units ordered over the 7-day window: Hero 70, Low stock 14, Bleeder 14, Launch 0. Those divided by 7 are the average daily units the rules already use (10, 2, 2, and 0).

**You run:** Seed, then a select returns exactly those four sku ids. Hero’s ordered product sales are 2000 and Hero’s fulfillable units are 280.

**You should understand:** Later checks depend on these ids, dates, and GBP amounts. Do not “improve” the stories while seeding.

**Not in this step:** A TypeScript database client, the dashboard.

---

### M14 — Read path: one snapshot, then the existing rules

**Concept:** A lookup assembles the snapshot the pure functions already accept. It does not reimplement them.

**Adds:** A server-side Supabase client. `getSkuSnapshot` loads sku + sales period + inventory + ad period and returns a `SkuSnapshot`. Average daily units = units ordered ÷ days in the period (7). A script loads Hero and prints the margin amount from `assessSku`.

**You run:** The script prints **500** for Hero. It does not insert a row.

**You should understand:** Reads have no draft side effect. The service-role key stays in server env only. If the number is not 500, the bug is in the assembly, not in `margin`, because M01 already pinned 500.

**Not in this step:** OpenAI, UI, writing a draft.

---

## Phase D — Workspace shell (still no model)

### M15 — Next.js App Router skeleton

**Concept:** Routes live under `app/`. This repo is now a web app plus `lib/`.

**Adds:** Next.js + TypeScript, CSS Modules available, `npm run dev`, a plain home page. Read `node_modules/next/dist/docs/` for this version before writing routes.

**You run:** The home page loads locally.

**You should understand:** `app/` is HTTP and HTML. Economics stay in `lib/`.

**Not in this step:** Login, live SKUs, OpenAI, Vercel.

---

### M16 — Workspace layout, labels only

**Concept:** One product surface. The operator can see where numbers will go before any number is loaded.

**Adds:** A workspace page with empty labeled regions: a KPI strip, a SKU table, and a panel reserved for the weekly brief.

**You run:** Open the workspace and see those labels.

**You should understand:** A Seller Central home page is also a strip of totals plus a list of products. Ours lists SKUs, not orders. Orders are not the unit of this app.

**Not in this step:** Live data, a model, login.

---

### M17 — Demo login and an HttpOnly session

**Concept:** The server decides who is signed in. The browser never handles the demo password as a token.

**Adds:** A login form that POSTs the password to a route. The route compares it with `DEMO_PASSWORD` in server env. On a match it sets a session cookie: `HttpOnly`, `SameSite=Lax`, `Secure` in production, signed with `SESSION_SECRET`. JavaScript on the page cannot read the cookie. Protected routes check that cookie and return 401 when it is missing or invalid. There is no `Authorization` header carrying the demo password.

**You run:** Open a protected placeholder route with no cookie and get 401. Log in through the form and the same route returns 200. The cookie is absent from `document.cookie`.

**You should understand:** This is a single shared demo login, not Supabase Auth and not a user table. M18 comes after this, so the SKU table requires the session.

**Not in this step:** SKU data, drafts, a model.

---

### M18 — SKU table reads assessments through your API

**Concept:** The browser calls your route. The route calls `lib/`. The browser never holds the service-role key.

**Adds:** A route that requires the M17 session cookie, loads the four snapshots, runs `assessSku`, and returns the rows. The workspace table shows seller SKU, name, margin amount, days of cover, reorder, ACOS, TACOS, bleeder, and checklist. Dev wire logs on both sides.

**You run:** Log in. The table shows the mug, the bottle, the case, and the lamp. The bottle is the reorder. The case is the bleeder. The lamp is the checklist. Call the same route without the cookie and get 401, with no SKU JSON.

**You should understand:** The table displays facts the functions already computed. It does not decide a second margin.

**Not in this step:** Chat, tools, drafts, OpenAI.

---

## Phase E — Chat tool loop (one concept at a time)

### M19 — Tool dispatcher, `get_sku_summary` only

**Concept:** A tool name maps to a `lib/` function. Arguments are checked. The result is JSON.

**Adds:** `dispatchTool`. It accepts `get_sku_summary` and returns the snapshot’s identity plus the `assessSku` result. A unit test calls it. An unknown id is a clear not-found error, not a stack trace. If there is an HTTP route, it requires the M17 session cookie.

**You run:** Call `get_sku_summary` for `sku-missing`. The result is a clear not-found error.

**You should understand:** The same dispatcher is what the model will call later. The tool returns numbers. It does not write a sentence and it does not write a draft.

**Not in this step:** A model, streaming UI, a second tool.

---

### M20 — Add `list_skus` to the dispatcher

**Concept:** A list of SKUs is a read. It does not flag them by itself.

**Adds:** `list_skus` on the same dispatcher. It returns id, seller SKU, name, and stage for the four stories.

**You run:** The call returns four ids, including `sku-launch`.

**You should understand:** Listing the catalog is not the same as deciding who is in trouble. Flags are the next tool.

**Not in this step:** A model, `list_skus_flagged`.

---

### M21 — Add `list_skus_flagged`

**Concept:** “Who needs a reorder?” is a filter over `assessSku`, not a new rule.

**Adds:** `list_skus_flagged` with one argument: `reorder`, `bleeder`, or `launch`. It uses the assessment fields. A unit test expects the bottle for reorder, the case for bleeder, and the lamp for launch.

**You run:** Those three calls.

**You should understand:** Launch is a stage, not a failure. The bottle can be low on stock and still not be a bleeder. The case can be a bleeder and still have 40 days of cover.

**Not in this step:** The model, the brief.

---

### M22 — Chat panel wired to a stub reply

**Concept:** The page can send a message and show a reply before any model exists.

**Adds:** Chat UI on the workspace. A server route that returns a fixed sentence and does not call OpenAI. The route requires the M17 session cookie. Dev wire logs on both sides.

**You run:** Type “hello”. The transcript shows your message and the stub reply. Without the cookie the route returns 401.

**Not in this step:** An API key, tools.

---

### M23 — One real model reply, no tools

**Concept:** The server calls OpenAI. The key stays in server env. The model cannot call tools yet.

**Adds:** The route uses the chat completion API and returns the model’s text. Record token usage on the server if the response includes it (storage is M36).

**You run:** Ask a general question. You get a model sentence. The browser network tab does not contain the API key.

**You should understand:** A fluent sentence is not a metric. This step has no SKU numbers in the prompt on purpose.

**Not in this step:** `get_sku_summary`, drafts, multi-turn history on the wire (M24).

---

### M24 — Prior turns on the wire

**Concept:** The transcript is not just decoration. Each new message is answered in the context of earlier user and assistant turns.

**Adds:** The chat panel sends the prior transcript with the new message. The route validates and caps that history. The server-only system prompt is still set on the server. Still one reply. Still no tools. No Postgres thread store. The browser holds the transcript in React state.

**You run:** Ask which SKU story is the mug, then “what about the bottle?”, and see the reply stay on the bottle without you repeating the whole catalog. Use the stub facts only if this step’s prompt is not allowed to invent economics. If the prompt has no tool access, ask a non-metric follow-up instead (the capital-style check from the previous project is fine).

**Not in this step:** Tools, persisted chat sessions.

---

### M25 — `get_sku_summary` inside the tool loop

**Concept:** The model may request a tool. Your server runs it and sends the result back. Then the model writes the final sentence.

**Adds:** `get_sku_summary` registered on the loop from M24. The transcript shows the tool name and arguments.

**You run:** “Look up sku-hero.” The transcript shows `get_sku_summary` and a short summary whose margin amount is **500**, the tool’s number.

**You should understand:** The model is allowed to phrase the sentence. It is not allowed to be the source of the 500. If the reply says a different margin, that is a failed run.

**Not in this step:** `list_skus_flagged`, a stored brief.

---

### M26 — `list_skus_flagged` on the loop

**Concept:** A “who is in trouble?” question is answered by the flag tool, not by the model scanning memory.

**Adds:** `list_skus_flagged` on the same loop, beside `get_sku_summary` and `list_skus`.

**You run:** Ask who needs a reorder. The transcript shows the tool call and the reply names the bottle. Ask who is bleeding. The reply names the case.

**Not in this step:** The full weekly brief, drafts.

---

### M27 — Weekly brief, grounded in tool results

**Concept:** The brief is one constrained reply. Every figure in it comes from a tool result in that turn.

**Adds:** A brief action (a button or a fixed first message) that asks for this week’s brief. The server-side prompt tells the model to use the tools and not to invent numbers. The reply is shown in the brief panel. It is not stored yet.

**You run:** Generate the brief. You can point at the tool payloads and find the bottle’s 5 days of cover, the case’s bleeder flag, and the lamp described as a launch checklist. Hero is not called a bleeder. The lamp is not called a bleeder.

**You should understand:** This is the applied-AI line in the project. The model writes the paragraph a seller would read on Monday. The code still owns the flags. This run is not the eval script (that is M37).

**Not in this step:** Saving the brief, listing copy, PPC drafts, RAG.

---

## Phase F — Drafts a person can approve

### M28 — `drafts` table

**Concept:** A draft is a row with a status. Creating the table does not write one.

**Adds:** Migration. Columns: id, sku id, kind (`listing` or `ppc`), body, status (`draft` or `approved`), created at. No Amazon submission id. Row level security on and no policies, so the Data API cannot read the table.

**You run:** The table exists and has 0 rows.

**You should understand:** Status `draft` means a person has not accepted it. `approved` still will not mean it was sent to Seller Central.

**Not in this step:** Inserts, the model, an apply button.

---

### M29 — `draft_listing_refresh` stores a listing draft

**Concept:** The model may draft listing copy. The only write is a `draft` row in our table.

**Adds:** A tool that takes a sku id, calls `get_sku_summary` for the facts, asks the model for title and bullet text, and inserts one `drafts` row with kind `listing` and status `draft`. The route requires the session cookie. Dev wire logs if the browser calls it.

**You run:** Draft a refresh for `sku-hero`. One row exists, status `draft`. Nothing in the row is an Amazon write.

**You should understand:** Listing copy is the title and bullets a shopper reads on the ASIN. We can practice the words. We cannot push them to the catalog from this app.

**Not in this step:** PPC notes, approve, search terms.

---

### M30 — Negative-candidate rule, in memory

**Concept:** A search term that spent money and was credited with no sales is a negative candidate. That decision is code.

**Adds:** A small type for a search term (term, spend, attributed sales) and `isNegativeCandidate` in `lib/`, with tests. A few in-memory terms for the bleeder: one that sold, two that only spent. No table yet.

**You run:** `npm test`. The converting term is not a candidate. The two zero-sales terms are.

**You should understand:**

- The search-term report lists queries shoppers typed before they clicked your ad.
- A negative keyword tells Amazon not to match that query again. Sellers add negatives when a term spends and does not convert.
- One bleeder term should stay off the list because it has attributed sales. Spend alone is not the rule. Spend with zero attributed sales is the rule.
- Suggested terms for the tests: “clear iphone case” (spend 40, attributed sales 80), “free phone case” (spend 30, attributed sales 0), “cheap phone case” (spend 25, attributed sales 0).

**Not in this step:** Postgres, a draft paragraph, creating the negative in Ads Console.

---

### M31 — Table: `search_terms`, seeded

**Concept:** Those queries become rows, the way the search-term report is a different download from the advertised-product report.

**Adds:** Migration and seed for the three terms in M30, attached to `sku-bleeder`, for the same date window. A read function returns them.

**You run:** A select or a script prints three terms for the bleeder and no terms for the hero.

**You should understand:** Hero can be advertised and still have no rows here. We only seeded the lesson. An empty search-term list is not a bug for the mug.

**Not in this step:** The PPC draft tool.

---

### M32 — `draft_ppc_notes` stores a PPC draft

**Concept:** The model writes the note. The candidate list comes from `isNegativeCandidate`.

**Adds:** A tool that loads the SKU summary and its search terms, keeps the candidates with the pure function, and inserts one `drafts` row with kind `ppc` and status `draft`. For the bleeder, the stored body is allowed to mention pausing or negating. The candidate terms in the body must be terms the function returned.

**You run:** Draft PPC notes for `sku-bleeder`. The row is `draft`. The body can name “free phone case” and “cheap phone case”. It must not recommend negating “clear iphone case” unless the function said so (it does not).

**You should understand:** Pause, bid down, and add negatives are things a person does in Campaign Manager. This row is a suggestion.

**Not in this step:** Approve, a live Ads API.

---

### M33 — The human approves; apply is a stub

**Concept:** A status change happens only when the signed-in human approves that draft. The model cannot approve it. Apply does not call Amazon.

**Adds:** An approve control. It POSTs to a route that is not a model tool. The route requires the M17 session cookie and sets that row’s status to `approved`. A separate apply action returns a clear “not sent to Amazon” result and does not add a submission id. A body field such as `approved: true` from the model is ignored.

**You run:** Approve the bleeder PPC draft. The row is `approved`. Apply leaves it approved and reports that Seller Central was not contacted. The same approve request without the cookie changes nothing.

**You should understand:** Skipping the button cannot approve a row. A forged confirm cannot approve a row.

**Not in this step:** SP-API, a real negative-keyword create.

---

## Phase G — Observability

### M34 — `audit_logs` table

**Concept:** Every tool call can leave a row: tool name, arguments, outcome, and whether a draft row was created.

**Adds:** The migration only. No API keys and no raw secrets in the column list. Row level security on and no policies.

**You run:** The table exists and is empty.

**Not in this step:** Writing rows, token columns.

---

### M35 — Write an audit row for every tool call

**Concept:** Successes and failures are both logged. A failed lookup logs the error and does not insert a draft.

**Adds:** The dispatcher writes one audit row per call.

**You run:** Look up `sku-missing`. An audit row exists, the caller sees a plain not-found error, and the draft count is unchanged.

**Not in this step:** A cost dashboard.

---

### M36 — Token usage for each chat turn

**Concept:** When OpenAI returns usage, store the prompt, completion, and total tokens for that turn.

**Adds:** A small usage table, filled from the provider response. No message text and no API key column.

**You run:** One chat turn. The stored total matches the usage object from that response.

**Not in this step:** A billing dashboard.

---

## Phase H — Small scorecard

### M37 — Eval set of about 5–10 cases

**Concept:** Publish what passed and what failed. Do not invent an accuracy percentage.

**Adds:** A script with a short set grown from the checks we already run:

- Hero’s tool summary margin amount is 500.
- Reorder flag list contains the bottle and not the mug.
- Bleeder flag list contains the case.
- Launch flag list contains the lamp, and the lamp is not on the bleeder list.
- A brief turn includes the bottle and does not call the lamp a bleeder.
- Negative candidates are the two zero-sales terms only.
- An unknown SKU is a clear error and creates no draft.
- A model argument cannot set a draft to approved.

**You run:** The eval script. Record pass and fail, plus a sample token total from one run.

**You should understand:** The model can be talked into asking. The flag functions and the approve route are what hold the line. This is not a general prompt-injection detector.

**Not in this step:** The portfolio write-up.

---

## Phase I — Portfolio release

### M38 — README, mock-data banner, and Vercel

**Concept:** A stranger can open the app, log in, and see that the numbers are the four seed stories.

**Adds:** Production Vercel settings. Server env holds `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` if a step used direct Postgres, `DEMO_PASSWORD`, `SESSION_SECRET`, and optional `OPENAI_MODEL`. The README lists those names, the architecture, the tool list, and how approve works (the stub). The UI shows a banner that the data is mock. Screenshots of the dashboard and one brief.

**You run:** Open the deployed URL, log in, read the four SKUs, and generate a brief. The bottle is the reorder and the case is the bleeder.

**Done when:** A stranger can follow the README without this chat.

**Not in this step:** CSV import, SP-API.

---

## Later (do not number these until M38 is done)

- CSV upload, one Seller Central report shape at a time (Business Report, FBA inventory, advertised product, search term).
- A `ReportSource` interface. The mock stays the default. SP-API is another implementation behind it.
- Stored SOP pages and pgvector, only if a brief needs to cite your own rules.

---

## Session checklist

1. Open only the current micro-step (the next one is M04).
2. Implement only what that step lists under **Adds**.
3. If the step wires browser UI to a route handler, add the dev wire logs from **How we work** §8.
4. Run **You run**.
5. Say the step is done before starting the next id.

**Optional prompt line** when you want the wire logs called out:

> When this step adds or changes a browser → API call, include development-only `console.log`s on both sides so I can see URL, request body, and response in DevTools and the dev server terminal.

## When you’re ready

M01, M02, and M03 are done. Next session is **M04 only**: add `asin` beside the seller SKU, and leave the economics alone.
