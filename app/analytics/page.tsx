type Stats = {
  configured: boolean;
  message?: string;
  days?: number;
  counts?: Record<string, number>;
  funnel?: { page_view: number; calculation_completed: number; provider_clicked: number; email_submitted: number; click_rate_percent: number; target_ge_8_percent: boolean };
  byCampaign?: Record<string, Record<string, number>>;
  byDay?: Record<string, Record<string, number>>;
};

async function getStats(): Promise<Stats> {
  try {
    // On Vercel, VERCEL_URL is like xxx.vercel.app without protocol; prod custom domain is in VERCEL_PROJECT_PRODUCTION_URL or header
    // Try production url first, then VERCEL_URL, then localhost fallback. Use headers() to get real host if available.
    let base = "";
    try {
      const { headers } = await import("next/headers");
      const h = headers();
      const host = h.get("x-forwarded-host") || h.get("host") || "";
      const proto = h.get("x-forwarded-proto") || "https";
      if (host) base = `${proto}://${host}`;
    } catch {}
    if (!base) {
      base = process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
    }
    const res = await fetch(`${base}/api/analytics?days=7`, { cache: "no-store" }).catch(() => null);
    if (res && res.ok) return await res.json();
    const txt = res ? await res.text().catch(() => "") : "";
    return { configured: false, message: txt ? `fetch failed: ${res?.status} ${txt.slice(0,120)}` : "Could not fetch /api/analytics (dev without server?)" };
  } catch (e: any) {
    return { configured: false, message: `fetch failed: ${e?.message || e}` };
  }
}

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center font-extrabold text-sm">RW</div>
            <span className="font-bold">RinggitWise</span>
            <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded-full ml-2">Analytics</span>
          </div>
          <a href="/" className="text-sm underline">Back to calculator</a>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold">Funnel — last {stats.days || 7} days</h1>
        <p className="text-sm text-slate-600 mt-1">page_view → calculation_completed → provider_clicked → email_submitted. Target: provider click rate ≥8%.</p>

        {!stats.configured && (
          <div className="mt-6 rounded-xl border bg-amber-50 border-amber-200 p-4 text-sm">
            <div className="font-bold text-amber-900">Supabase not configured yet</div>
            <p className="mt-1 text-amber-800">{stats.message || "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel env."}</p>
            <div className="mt-3 text-xs font-mono bg-white border rounded p-3">
              <div>1. Create Supabase project (free)</div>
              <div>2. SQL editor → paste <code>supabase/schema.sql</code></div>
              <div>3. Vercel → Settings → Environment Variables → add:</div>
              <div className="ml-4">NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co</div>
              <div className="ml-4">NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...</div>
              <div className="ml-4">SUPABASE_SERVICE_ROLE_KEY=eyJ... (optional, for writes bypass RLS)</div>
              <div>4. Redeploy → events will persist</div>
            </div>
            <p className="mt-2 text-xs text-slate-600">Until then, events are logged to server console + localStorage (see browser devtools → Application → Local Storage → rw_events).</p>
          </div>
        )}

        {stats.funnel && (
          <>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border p-5">
                <div className="text-xs uppercase tracking-widest text-slate-500">Page views</div>
                <div className="text-2xl font-extrabold mt-1">{stats.funnel.page_view}</div>
              </div>
              <div className="bg-white rounded-2xl border p-5">
                <div className="text-xs uppercase tracking-widest text-slate-500">Calculations</div>
                <div className="text-2xl font-extrabold mt-1">{stats.funnel.calculation_completed}</div>
              </div>
              <div className={`rounded-2xl border p-5 ${stats.funnel.target_ge_8_percent ? "bg-emerald-50 border-emerald-200" : "bg-white"}`}>
                <div className="text-xs uppercase tracking-widest text-slate-500">Provider clicks</div>
                <div className="text-2xl font-extrabold mt-1">{stats.funnel.provider_clicked} <span className="text-sm font-normal text-slate-500">({stats.funnel.click_rate_percent}%)</span></div>
                <div className={`text-xs mt-1 font-semibold ${stats.funnel.target_ge_8_percent ? "text-emerald-700" : "text-amber-700"}`}>{stats.funnel.target_ge_8_percent ? "≥8% target hit" : "<8% — iterate on result/CTA"}</div>
              </div>
              <div className="bg-white rounded-2xl border p-5">
                <div className="text-xs uppercase tracking-widest text-slate-500">Emails</div>
                <div className="text-2xl font-extrabold mt-1">{stats.funnel.email_submitted}</div>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border p-5">
                <h3 className="font-bold text-sm">By campaign (utm_campaign)</h3>
                <table className="mt-3 w-full text-xs">
                  <thead><tr className="text-slate-500 text-left"><th>Campaign</th><th>Views</th><th>Calc</th><th>Clicks</th></tr></thead>
                  <tbody>
                    {Object.entries(stats.byCampaign || {}).sort((a,b)=> (b[1].provider_clicked||0)-(a[1].provider_clicked||0)).map(([k,v])=>(
                      <tr key={k} className="border-t"><td className="py-1.5 font-medium">{k}</td><td>{v.page_view||0}</td><td>{v.calculation_completed||0}</td><td className="font-bold">{v.provider_clicked||0}</td></tr>
                    ))}
                    {Object.keys(stats.byCampaign||{}).length===0 && <tr><td colSpan={4} className="py-4 text-center text-slate-400">No data yet</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="bg-white rounded-2xl border p-5">
                <h3 className="font-bold text-sm">By day</h3>
                <table className="mt-3 w-full text-xs">
                  <thead><tr className="text-slate-500 text-left"><th>Day</th><th>Views</th><th>Calc</th><th>Clicks</th></tr></thead>
                  <tbody>
                    {Object.entries(stats.byDay || {}).sort((a,b)=> b[0].localeCompare(a[0])).slice(0,14).map(([k,v])=>(
                      <tr key={k} className="border-t"><td className="py-1.5 font-mono">{k}</td><td>{v.page_view||0}</td><td>{v.calculation_completed||0}</td><td className="font-bold">{v.provider_clicked||0}</td></tr>
                    ))}
                    {Object.keys(stats.byDay||{}).length===0 && <tr><td colSpan={4} className="py-4 text-center text-slate-400">No data yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 rounded-xl border bg-white p-4 text-xs text-slate-600">
              <span className="font-semibold">Raw counts:</span> <code className="bg-slate-100 px-1.5 py-0.5 rounded">{JSON.stringify(stats.counts)}</code>
            </div>
          </>
        )}

        <div className="mt-8 text-xs text-slate-500">
          API: <code className="bg-white border px-1 py-0.5 rounded">GET /api/analytics?days=7</code> · Events POST to <code className="bg-white border px-1 py-0.5 rounded">POST /api/analytics</code> via <code>lib/analytics.ts:12</code> sendBeacon.
        </div>
      </main>
    </div>
  );
}
