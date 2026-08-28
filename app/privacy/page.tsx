import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - RinggitWise",
  description: "Privacy policy for RinggitWise SGD to MYR calculator. How we handle analytics and email data.",
};

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500 mt-1">Last updated: 28 Aug 2026</p>
          <div className="mt-6 prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
            <p>RinggitWise is an indicative FX comparison tool for SGD to MYR. We do not hold money, execute transfers, or perform KYC.</p>
            <h2 className="font-bold text-slate-900 mt-6">1. Data we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Analytics events:</strong> page_view, calculator_started, calculation_completed, provider_clicked, email_submitted. These are pseudonymized and used to measure the funnel. See lib/analytics.ts and app/api/analytics/route.ts. Currently logged to Vercel logs.</li>
              <li><strong>Email (optional):</strong> If you submit the rate alert form, your email is sent to Formspree (https://formspree.io/f/mbgjjwzo) and forwarded to info@ai2eo.com. We use it only to notify you when SGD/MYR improves. You can request deletion at any time.</li>
              <li><strong>Rate data:</strong> We fetch reference rates from Frankfurter (ECB) and fallback to fawazahmed0/currency-api. No personal data is sent to those APIs.</li>
            </ul>
            <h2 className="font-bold text-slate-900 mt-6">2. Cookies and local storage</h2>
            <p>We use localStorage to remember your last SGD amount and calculation result so a page refresh keeps your result. This stays in your browser and is not sent to our servers.</p>
            <h2 className="font-bold text-slate-900 mt-6">3. Third parties</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Formspree for email delivery</li>
              <li>Vercel for hosting and logs</li>
              <li>Frankfurter and jsDelivr for FX data</li>
              <li>Provider sites (Wise, Instarem, DBS) when you click Check rate. Their privacy policies apply after you leave our site.</li>
            </ul>
            <h2 className="font-bold text-slate-900 mt-6">4. Retention and rights</h2>
            <p>Analytics logs are retained for up to 90 days. Emails are kept until you unsubscribe or request deletion. Contact us at info@ai2eo.com to access, correct, or delete your data.</p>
            <h2 className="font-bold text-slate-900 mt-6">5. Contact</h2>
            <p>Questions: info@ai2eo.com</p>
          </div>
        </div>
      </main>
      <footer className="border-t bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 text-xs text-slate-500">
          <a href="/" className="underline hover:text-slate-700">Home</a> · <a href="/terms" className="underline hover:text-slate-700">Terms</a>
        </div>
      </footer>
    </div>
  );
}
