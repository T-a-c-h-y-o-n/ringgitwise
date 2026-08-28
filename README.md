# RinggitWise - SGD to MYR True Cost Calculator

> How much MYR will they really receive? Enter SGD, compare net MYR across providers after fees + FX spread.

Live: **https://ringgitwise.ai2eo.com**

Single-page MVP for validating whether users will calculate transfer cost and click through to alternative providers. SGD → MYR only. No login, no KYC, no money movement. All results are **indicative estimates**.

## Features
- SGD amount input with presets (100 / 1,000 / 5,000 / 10,000)
- Live reference rate: Frankfurter (ECB) → fallback fawazahmed0/currency-api → indicative 3.42
- 3 provider comparison (Wise, Instarem, DBS/Bank) - configurable in `lib/providers.ts`
- Fee + spread calculation: `netMYR = (SGD - fee) × referenceRate × (1 + spread)`
- Best/worst + potential difference highlighted
- Provider CTA tracking (`provider_clicked`)
- Analytics: `page_view`, `calculator_started`, `calculation_completed`, `provider_clicked`, `email_submitted`
- Mobile-first, estimate disclaimers, methodology section

## Stack
Next.js 14 / React 18 / Tailwind / TypeScript / Vitest

## Run locally
```bash
npm install
npm run dev    # http://localhost:3000
npm test       # vitest
npm run build
```

## Config
Provider fees/spreads: `lib/providers.ts` - update without touching `lib/calc.ts`
Rate source: `app/api/rate/route.ts`

## Disclaimer
Rates, fees and delivery times are indicative estimates and may differ from the provider's final offer. RinggitWise does not hold or transfer money. Verify live rate with provider before sending.

## Roadmap (Phase 2 if validated)
More providers, real affiliate links, rate alerts, additional corridors, programmatic SEO.
