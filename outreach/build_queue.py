#!/usr/bin/env python3
"""Build outreach queue.csv from Lead Job exports with dedup + segment tagging."""
import csv, glob, os, re
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_GLOB = str(ROOT.parent / "Lead Job" / "data" / "leadjob_*.csv")
OUT = ROOT / "outreach" / "queue.csv"

# Simple segment rules
def tag_segment(row, source_file):
    name = (row.get("company") or "").lower()
    domain = (row.get("domain") or "").lower()
    cat = (row.get("category") or "").lower()
    email = (row.get("email") or "").lower()
    # money changer / remittance -> partner
    if "money changer" in name or "moneychanger" in name or "remittance" in name or "remit" in name or "exchange" in name:
        return "partner"
    if "remittance" in source_file or "moneychanger" in source_file:
        # from SG remittance file -> mostly partner
        return "partner"
    if "grocery" in source_file or "mart" in name or "grocer" in name or "supermarket" in name:
        return "my_seller"
    # fallback: small business ex SG
    return "freelancer_smb"

AMOUNT_BY_SEGMENT = {"partner": 5000, "my_seller": 5000, "freelancer_smb": 1000, "expat": 1000}
SAVINGS_BY_AMOUNT = {1000: 79, 5000: 304, 10000: 586}
TEMPLATE_BY_SEGMENT = {"partner": "4_moneychanger", "my_seller": "3_my_seller", "freelancer_smb": "2_freelancer", "expat": "1_expat"}

def main():
    files = glob.glob(DATA_GLOB)
    if not files:
        print(f"No files matched {DATA_GLOB}")
        return
    seen_email = set()
    seen_domain = set()
    rows_out = []
    lead_id_seq = 0
    for fp in sorted(files):
        with open(fp, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for r in reader:
                email = (r.get("email") or "").strip().lower()
                domain = (r.get("domain") or "").strip().lower()
                company = (r.get("company") or "").strip()
                if not company:
                    continue
                # dedup
                dedup_key = email or domain
                if email and email in seen_email:
                    continue
                if domain and domain.startswith("maps-"):  # skip maps placeholder domains
                    domain = ""
                if email:
                    seen_email.add(email)
                if domain:
                    if domain in seen_domain and not email:
                        continue
                    seen_domain.add(domain)
                # skip obvious non-leads (news/meta)
                if any(x in email for x in ["@sph.com.sg", "@cision.com"]):
                    # keep but mark low priority - still count but filtered later
                    pass
                if not email:
                    # queue only emailable for now; phone-only kept for whatsapp batch separately
                    continue
                # filter generic noise? keep for now - user can filter
                seg = tag_segment(r, fp.lower())
                amt = AMOUNT_BY_SEGMENT.get(seg, 1000)
                sav = SAVINGS_BY_AMOUNT.get(amt, 79)
                tpl = TEMPLATE_BY_SEGMENT.get(seg, "2_freelancer")
                utm_campaign = seg if seg != "my_seller" else "my_seller"
                lead_id_seq += 1
                rows_out.append({
                    "lead_id": f"RW-{lead_id_seq:04d}",
                    "company": company,
                    "domain": domain,
                    "email": email,
                    "phone": (r.get("phone") or "").strip(),
                    "segment": seg,
                    "template_id": tpl,
                    "amount_example": amt,
                    "savings_example": sav,
                    "utm_channel": "email",
                    "utm_campaign": utm_campaign,
                    "status": "pending",
                    "notes": os.path.basename(fp),
                })
    # sort: partner first (higher intent for B2B), then emailable with real domains
    rows_out.sort(key=lambda x: (0 if x["segment"]=="partner" and "." in x["domain"] and not x["domain"].startswith("maps") else 1, x["segment"]))
    # write
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", newline="", encoding="utf-8") as out:
        w = csv.DictWriter(out, fieldnames=["lead_id","company","domain","email","phone","segment","template_id","amount_example","savings_example","utm_channel","utm_campaign","status","notes"])
        w.writeheader()
        w.writerows(rows_out)
    print(f"Wrote {len(rows_out)} emailable leads to {OUT}")
    # summary
    from collections import Counter
    c = Counter(x["segment"] for x in rows_out)
    print("Segments:", dict(c))
    # also report phone-only count
    total_rows = sum(1 for fp in files for _ in open(fp, encoding="utf-8-sig")) - len(files)
    print(f"Total raw rows (all files): {total_rows}, emailable queued: {len(rows_out)}, phone-only skipped: {total_rows - len(rows_out)}")

if __name__ == "__main__":
    main()
