import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms - RinggitWise",
  description: "Terms of use for RinggitWise SGD to MYR indicative calculator.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center font-extrabold text-sm">RW</div>
            <span className="font-bold tracking-tight">RinggitWise</span>
          </a>
          <a href="/" className="text-sm text-slate-600 hover:text-slate-900 underline">Back to calculator</a>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <div className="bg-white rounded-2xl border p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Terms of Use</h1>
          <p className="text-xs text-slate-500 mt-1">Last updated: 28 Aug 2026</p>
          <div className="mt-6 prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
            <h2 className="font-bold text-slate-900 mt-6">1. Indicative estimates only</h2>
            <p>All rates, fees, spreads, and delivery times shown are indicative estimates. They may differ from the final offer by the provider at the time of transfer. Calculation: net MYR = (SGD - flat fee - percent fee) x reference rate x (1 + spread). See lib/providers.ts for placeholder spreads: Wise -0.3%, Instarem -0.8%, DBS/Bank -2.5%.</p>
            <h2 className="font-bold text-slate-900 mt-6">2. No licensed money transmission</h2>
            <p>RinggitWise does not hold funds, execute transfers, or provide financial advice. Verify the live rate and fee with the provider before sending. We are not a bank or licensed money transmitter.</p>
            <h2 className="font-bold text-slate-900 mt-6">3. Affiliate disclosure</h2>
            <p>Some Check rate links may be affiliate links. If you click and complete a transfer, we may earn a commission at no extra cost to you. This does not affect the provider rate shown.</p>
            <h2 className="font-bold text-slate-900 mt-6">4. No warranty</h2>
            <p>Service is provided as is. Reference rates come from Frankfurter (ECB) with fallback to fawazahmed0/currency-api. If both fail, a static indicative rate is shown. We do not guarantee accuracy or availability.</p>
            <h2 className="font-bold text-slate-900 mt-6">5. Acceptable use</h2>
            <p>Do not abuse rate endpoints or attempt to scrape provider sites through us. We may rate limit.</p>
            <h2 className="font-bold text-slate-900 mt-6">6. Limitation of liability</h2>
            <p>To the extent permitted by law, RinggitWise is not liable for losses arising from use of estimates or provider services.</p>
            <h2 className="font-bold text-slate-900 mt-6">7. Contact</h2>
            <p>Questions: info@ai2eo.com</p>
          </div>
        </div>
      </main>
      <footer className="border-t bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 text-xs text-slate-500">
          <a href="/" className="underline hover:text-slate-700">Home</a> · <a href="/privacy" className="underline hover:text-slate-700">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
