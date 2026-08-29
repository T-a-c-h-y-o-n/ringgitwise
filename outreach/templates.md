# RinggitWise Outreach Templates — SG → MY

> Rule: No spam. Personalized, 1-sentence value, 1 link, no pressure. Always "estimated / indicative" language.
> CTA link: https://ringgitwise.ai2eo.com/?utm_source=outreach&utm_medium={{channel}}&utm_campaign={{segment}}
> Test, then scale. KPI: Provider Click Rate = Provider Clicks / Completed Calculations (target ≥8% per 48h plan)

## Variables
- {{name}} = contact first name or company
- {{amount_example}} = segment-relevant amount (1000 / 5000 / 10000)
- {{savings_example}} = precomputed MYR diff for that amount (Wise vs Bank)
- {{channel}} = email / whatsapp / linkedin / dm

## Precomputed savings examples (reference rate 3.1668 on 2026-08-28)
- SGD 1,000 → Best est. MYR 3,136 vs Bank est. MYR 3,057 → diff **MYR ~79**
- SGD 5,000 → Best est. MYR 15,711 vs Bank est. MYR 15,407 → diff **MYR ~304**
- SGD 10,000 → Best est. MYR 31,430 vs Bank est. MYR 30,844 → diff **MYR ~586**

Formula: Net MYR = (SGD - fee) × (ref × (1+spread)). Spread: Wise -0.3%, Instarem -0.8%, Bank -2.5%. Fees: Wise 2.5+0.43%, Instarem 0.35%, Bank 10 flat. All indicative.

---

### 1) SG → MY Expat / Individual (regular remittance)
Subject: Quick check: SGD {{amount_example}} → MY this week

Hi {{name}},

I built a tiny SGD → MYR calculator that shows what actually lands as MYR after fees + FX spread - not just the headline rate.

Example: SGD {{amount_example}} → est. MYR {{savings_example}} difference between best estimate and bank reference on today's indicative rate.

No login, 10 seconds: https://ringgitwise.ai2eo.com/?utm_source=outreach&utm_medium={{channel}}&utm_campaign=expat

If not relevant, ignore. Feedback welcome - does the estimate help you decide?

Best,
Ali — RinggitWise (indicative estimates only)

---

### 2) Freelancer / Small Business (SG-MY payments)
Subject: SG-MY payment: net MYR in 10 seconds

Hi {{name}},

For teams paying SG → MY, we made a one-page tool that compares net MYR received across 3 providers including fees + spread.

SGD {{amount_example}} example shows up to MYR {{savings_example}} gap - worth a 10-sec check before you send: https://ringgitwise.ai2eo.com/?utm_source=outreach&utm_medium={{channel}}&utm_campaign=freelancer_smb

Estimated and indicative - click through to verify live rate with provider.

Would you use this monthly?

Ali — RinggitWise

---

### 3) MY Seller / Shopee / Importer (receiving from SG)
Subject: Shopee SG → MY: how much MYR really arrives?

Hi {{name}},

If you receive SGD from Singapore buyers/suppliers, this shows the estimated net MYR after fees + FX for SGD {{amount_example}}:

Try: https://ringgitwise.ai2eo.com/?utm_source=outreach&utm_medium={{channel}}&utm_campaign=my_seller

Example diff on today's reference: MYR {{savings_example}} between best estimate and bank. No account needed.

Useful for your payouts? Happy to tailor for your volume.

Ali — RinggitWise (not a money transmitter, estimates only)

---

### 4) Money Changer / Remittance Shop (B2B / Partner)
Subject: Partnership? RinggitWise sends you pre-qualified SG→MY traffic

Hi {{name}},

RinggitWise compares SGD→MYR net MYR across providers (fees + spread included). Users see your shop vs others, then click "Check rate" to verify live rate.

We already list 71 SG money changers/remittance shops in our research - happy to feature {{name}} properly with correct fee/rate and direct link.

Demo: https://ringgitwise.ai2eo.com/?utm_source=outreach&utm_medium={{channel}}&utm_campaign=partner

Open to a quick 10-min chat on how we send intent-driven clicks?

Ali — RinggitWise

---

### 5) Follow-up (3 days later, only if opened/clicked, no reply)
Subject: Re: SGD → MYR check

Hi {{name}},

Bump - did the calculator load ok? Any feedback on the estimate vs what you actually got?

If useful, I can send a monthly rate-improvement alert (opt-in on the page).

Thanks,
Ali

---

## WhatsApp / Telegram short version (use for warm leads only)

Hi {{name}}, quick tool: SGD {{amount_example}} → MYR net after fees+FX? 10-sec estimate here: https://ringgitwise.ai2eo.com/?utm_source=outreach&utm_medium={{channel}}&utm_campaign={{segment}} — difference up to MYR {{savings_example}} vs bank on today's rate. Indicative only. Feedback welcome?

## LinkedIn DM short

Hi {{name}} — built a 10-sec SGD→MYR net calculator (fees+spread, 3 providers). Example: SGD {{amount_example}} → ~MYR {{savings_example}} gap. Would you sanity-check it? https://ringgitwise.ai2eo.com

---

## Sending checklist (per lead)
- [ ] Verify email via Domain/MX (use Lead Job validation)
- [ ] Personalize {{name}}, {{amount_example}}, {{savings_example}} by segment
- [ ] Set utm_campaign correctly (for analytics: provider_clicked attribution)
- [ ] Max 25/day per inbox, 3-min pace (use gonder_outreach.py --limit 25 --pace 180 if SMTP)
- [ ] Log: lead_id, email, date, template_id, utm
- [ ] Track: outreach_sent → landing_visit → calculation_completed → provider_clicked

## Next batch
Use Lead Job exports to fill outreach queue: leadjob_32/33/34 already + leadjob_35_JB + leadjob_36_Penang incoming.
Dedup by domain/email, filter out generic @gmail where possible, prioritize shops with phone + domain.
