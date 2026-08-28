"use client";
import { useEffect, useState } from "react";
import { validateAmount, calculate } from "@/lib/calc";
import { track } from "@/lib/analytics";
import { PROVIDERS } from "@/lib/providers";

type RateData = { rate: number; source: string; lastUpdated: string; live: boolean };

function formatMYR(n: number) {
  return new Intl.NumberFormat("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function formatSGD(n: number) {
  return new Intl.NumberFormat("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function formatRate(n: number) {
  return n.toFixed(4);
}

export default function Page() {
  const [amount, setAmount] = useState("1000");
  const [rateData, setRateData] = useState<RateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rateError, setRateError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof calculate> | null>(null);
  const [started, setStarted] = useState(false);
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  // Persist last amount and result across refresh via localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ringgitwise_amount");
      if (saved) setAmount(saved);
      const savedResult = localStorage.getItem("ringgitwise_result");
      if (savedResult) setResult(JSON.parse(savedResult));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("ringgitwise_amount", amount); } catch {}
  }, [amount]);
  useEffect(() => {
    try { if (result) localStorage.setItem("ringgitwise_result", JSON.stringify(result)); } catch {}
  }, [result]);

  useEffect(() => {
    track("page_view");
    fetchRate();
  }, []);

  async function fetchRate() {
    setLoading(true);
    setRateError(null);
    try {
      const res = await fetch("/api/rate", { cache: "no-store" });
      if (!res.ok) throw new Error("rate fetch failed");
      const data = await res.json();
      setRateData(data);
    } catch (e: any) {
      setRateError("Live rate unavailable. Using indicative estimate.");
      setRateData({ rate: 3.42, source: "Indicative reference (fallback)", lastUpdated: new Date().toISOString().slice(0, 10), live: false });
    } finally {
      setLoading(false);
    }
  }

  function onCalculate() {
    setError(null);
    const v = validateAmount(amount);
    if (!v.valid) {
      setError(v.error!);
      return;
    }
    if (!rateData) {
      setError("Rate not available. Please try again.");
      return;
    }
    if (!started) {
      track("calculator_started", { amount: v.value });
      setStarted(true);
    }
    const r = calculate({ amountSGD: v.value!, referenceRate: rateData.rate });
    setResult(r);
    track("calculation_completed", { amountSGD: v.value, referenceRate: rateData.rate, bestMYR: r.best.netMYR });
    // scroll to results
    setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function onProviderClick(providerId: string, providerName: string) {
    track("provider_clicked", { providerId, providerName, amountSGD: result?.amountSGD });
  }

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setEmailMsg("Please enter a valid email.");
      return;
    }
    track("email_submitted", { email: trimmed });
    try {
      const res = await fetch("https://formspree.io/f/mbgjjwzo", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, _subject: "RinggitWise rate alert" }),
      });
      if (res.ok) {
        setEmailMsg("Thanks - we'll notify you at info@ai2eo.com when SGD/MYR improves.");
        setEmail("");
      } else {
        const data = await res.json().catch(() => null);
        setEmailMsg(data?.errors?.[0]?.message || "Could not submit. Please try again or email info@ai2eo.com.");
      }
    } catch {
      setEmailMsg("Network error. Please try again or email info@ai2eo.com.");
    }
  }

  const presetAmounts = [100, 1000, 5000, 10000];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center font-extrabold text-sm">RW</div>
            <span className="font-bold tracking-tight">RinggitWise</span>
            <span className="hidden sm:inline text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium ml-2">MVP - Indicative</span>
          </div>
          <a href="#methodology" className="text-sm text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline">How we calculate</a>
        </div>
      </header>

      {/* Hero + Calculator */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 pt-8 pb-4">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="pt-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                How much <span className="text-cyan-700">MYR</span> will they really receive?
              </h1>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Enter SGD amount. See estimated net MYR across 3 providers, fees + FX spread included. No account needed.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-white"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> SGD → MYR only</span>
                <span className="px-2.5 py-1 rounded-full bg-white border">No money held</span>
                <span className="px-2.5 py-1 rounded-full bg-white border">Estimated & indicative</span>
              </div>

              {/* Data source bar */}
              <div className="mt-6 rounded-xl border bg-white p-3 flex flex-wrap gap-3 items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Reference rate:</span>
                  {loading ? (
                    <span className="inline-block w-24 h-4 bg-slate-200 animate-pulse rounded" />
                  ) : rateData ? (
                    <span className="font-mono font-semibold">1 SGD = {formatRate(rateData.rate)} MYR</span>
                  ) : null}
                  {rateData && !rateData.live && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">Indicative</span>}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Source: {rateData?.source ?? "-"} · Updated: {rateData?.lastUpdated ?? "-"} · <button onClick={fetchRate} className="underline hover:text-slate-700">Refresh</button>
                </div>
              </div>
              {rateError && <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{rateError}</p>}
            </div>

            {/* Calculator card */}
            <div className="bg-white rounded-2xl border shadow-sm p-5 sm:p-6">
              <label className="block text-sm font-semibold">SGD amount</label>
              <div className="mt-2 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">SGD</span>
                <input
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (!started && e.target.value.trim() !== "") {
                      track("calculator_started", { amount_raw: e.target.value });
                      setStarted(true);
                    }
                  }}
                  onFocus={() => {
                    if (!started) {
                      track("calculator_started");
                      setStarted(true);
                    }
                  }}
                  inputMode="decimal"
                  placeholder="1,000"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-cyan-600 focus:outline-none text-lg font-semibold"
                />
              </div>
              <div className="mt-2 flex gap-2 flex-wrap">
                {presetAmounts.map((n) => (
                  <button
                    key={n}
                    onClick={() => setAmount(String(n))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${amount === String(n) ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50"}`}
                  >
                    SGD {n.toLocaleString()}
                  </button>
                ))}
              </div>

              {error && <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

              <button
                onClick={onCalculate}
                disabled={loading}
                className="mt-4 w-full py-3.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-300 text-white font-bold text-base transition"
              >
                {loading ? "Loading rate..." : "Calculate → Compare"}
              </button>
              <p className="mt-2 text-[11px] text-slate-500 text-center">We estimate fees + spread. Final provider results may differ.</p>

              {/* Email capture (optional) */}
              <form onSubmit={onEmailSubmit} className="mt-4 pt-4 border-t">
                <label className="text-xs font-semibold text-slate-700">Get notified when SGD/MYR improves <span className="font-normal text-slate-500">(optional)</span></label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    type="email"
                    className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-cyan-600"
                  />
                  <button type="submit" className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-black">Notify me</button>
                </div>
                {emailMsg && <p className="mt-1.5 text-xs text-emerald-700">{emailMsg}</p>}
              </form>
            </div>
          </div>
        </section>

        {/* Results */}
        {result && (
          <section id="results" className="max-w-5xl mx-auto px-4 pb-8">
            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-slate-900 text-white p-5">
                <div className="text-xs uppercase tracking-widest opacity-70">You send</div>
                <div className="mt-1 text-2xl font-extrabold">SGD {formatSGD(result.amountSGD)}</div>
                <div className="text-xs opacity-60 mt-1">Reference: ~ MYR {formatMYR(result.referenceMYR)} before fees/spread</div>
              </div>
              <div className="rounded-2xl bg-white border p-5">
                <div className="text-xs uppercase tracking-widest text-slate-500">Best estimated net</div>
                <div className="mt-1 text-2xl font-extrabold text-emerald-700">MYR {formatMYR(result.best.netMYR)}</div>
                <div className="text-xs text-slate-500 mt-1">{result.best.provider.name} · Rate {formatRate(result.best.providerRate)}</div>
              </div>
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
                <div className="text-xs uppercase tracking-widest text-amber-800">Potential difference</div>
                <div className="mt-1 text-2xl font-extrabold text-amber-900">MYR {formatMYR(result.maxDifferenceMYR)}</div>
                <div className="text-xs text-amber-800/70 mt-1">Between best and worst of 3 providers</div>
              </div>
            </div>

            {/* Provider cards */}
            <div className="mt-6">
              <h2 className="text-sm font-bold tracking-widest uppercase text-slate-500">Provider comparison</h2>
              <p className="text-xs text-slate-500 mt-1">Estimates only. Provider fees and rates change. Click through to verify current rate.</p>
              <div className="mt-3 grid md:grid-cols-3 gap-4">
                {result.results.map((r, idx) => {
                  const isBest = idx === 0;
                  const href = r.provider.ctaUrl.replace("AMOUNT", String(result.amountSGD));
                  return (
                    <div key={r.provider.id} className={`rounded-2xl border bg-white p-5 flex flex-col ${isBest ? "ring-2 ring-emerald-500 border-emerald-200" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {r.provider.name}
                            {isBest && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold tracking-widest">BEST ESTIMATE</span>}
                            {r.provider.badge && !isBest && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border font-semibold">{r.provider.badge}</span>}
                          </div>
                          <div className="text-xs text-slate-500">{r.provider.bestFor} · {r.provider.speed}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-slate-500">Estimated rate</div>
                          <div className="font-mono font-semibold text-sm">{formatRate(r.providerRate)}</div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-slate-50 border p-3">
                        <div className="text-[11px] uppercase tracking-widest text-slate-500">You receive (est.)</div>
                        <div className="text-xl font-extrabold">MYR {formatMYR(r.netMYR)}</div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-slate-500">Fee</span><br /><span className="font-semibold">SGD {formatSGD(r.feeSGD)}</span></div>
                          <div><span className="text-slate-500">Total cost*</span><br /><span className="font-semibold">SGD {formatSGD(r.totalCostSGD)}</span></div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-2">* Fee + estimated spread vs reference. MYR {formatMYR(r.spreadCostMYR)} spread cost included.</div>
                      </div>

                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onProviderClick(r.provider.id, r.provider.name)}
                        className={`mt-4 w-full text-center py-2.5 rounded-xl font-bold text-sm transition ${isBest ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-900 hover:bg-black text-white"}`}
                      >
                        {r.provider.ctaLabel} →
                      </a>
                      <div className="text-[10px] text-slate-400 text-center mt-2">Affiliate link may earn us a commission at no extra cost to you.</div>
                    </div>
                  );
                })}
              </div>
              {!result.results[0] && null}
            </div>

            {/* Trust row */}
            <div className="mt-6 rounded-xl border bg-white p-4 text-xs text-slate-600">
              <div className="font-semibold">How this is estimated</div>
              <p className="mt-1 leading-relaxed">
                Net MYR = (SGD amount − estimated fee) × (reference rate × (1 − spread)). Reference rate from {rateData?.source ?? "FX source"}.
                Provider spreads/fees are indicative placeholders to illustrate comparison and can be updated in <code className="bg-slate-100 px-1 py-0.5 rounded">lib/providers.ts</code> without touching calculation logic.
                Rates are <strong>indicative / estimated</strong> and may differ from the provider&lsquo;s final offer.
              </p>
            </div>
          </section>
        )}

        {/* Methodology + Trust */}
        <section id="methodology" className="max-w-5xl mx-auto px-4 pb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border bg-white p-5">
              <h3 className="font-bold">Calculation methodology</h3>
              <ul className="mt-2 text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Reference rate = mid-market SGD→MYR from primary FX source (Frankfurter/ECB) with fallback to fawazahmed0.</li>
                <li>Provider net = (amount − flat fee − percent fee) × reference × (1 + spread).</li>
                <li>Spread: Wise −0.3%, Instarem −0.8%, Bank −2.5% (indicative, configurable).</li>
                <li>We show estimated net MYR, fee, and total cost (fee + spread).</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <h3 className="font-bold">Data sources & updates</h3>
              <p className="mt-2 text-sm text-slate-600">
                Primary: Frankfurter (ECB). Fallback: fawazahmed0/currency-api (CC0). If both fail, an indicative reference rate is shown and labelled as <em>Indicative</em>.
              </p>
              <p className="mt-2 text-xs text-slate-500">Last updated: {rateData?.lastUpdated ?? "-"} · Source: {rateData?.source ?? "-"} · {rateData?.live ? "Live" : "Indicative"}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs leading-relaxed text-amber-900">
            <strong>Estimate disclaimer:</strong> Rates, fees and delivery times are <strong>indicative estimates</strong> and may differ from the final rate offered by the provider at the time of transfer. RinggitWise does not hold or transfer money and is not a licensed money transmitter. Verify the live rate with the provider before sending. &nbsp;|&nbsp; <strong>Affiliate disclosure:</strong> Some provider links may be affiliate links. We may earn a commission if you use them, at no extra cost to you.
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
            <a href="#" className="underline hover:text-slate-700">Privacy</a>
            <a href="#" className="underline hover:text-slate-700">Terms</a>
            <a href="mailto:info@ai2eo.com" className="underline hover:text-slate-700">Contact: info@ai2eo.com</a>
            <span>© {new Date().getFullYear()} RinggitWise - Indicative FX comparison only</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Built for validation. SGD → MYR only. No login, no KYC, no money movement.</div>
        </div>
      </footer>
    </div>
  );
}
