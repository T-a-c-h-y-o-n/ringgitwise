import { NextResponse } from "next/server";
import { isSupabaseConfigured, getSupabaseEnv } from "@/lib/supabase";

export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();
    console.log("[analytics]", body);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  // Enrich
  const enriched = {
    event: body?.event || "unknown",
    props: body?.props || {},
    ts: body?.ts || new Date().toISOString(),
    url: body?.url || req.headers.get("referer") || "",
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "",
    ua: req.headers.get("user-agent") || "",
    utm_source: body?.props?.utm_source || new URL(body?.url || "http://x").searchParams.get("utm_source") || "",
    utm_campaign: body?.props?.utm_campaign || new URL(body?.url || "http://x").searchParams.get("utm_campaign") || "",
  };

  // If Supabase configured, store async (non-blocking for client)
  if (isSupabaseConfigured()) {
    try {
      const { url, service, anon } = getSupabaseEnv();
      const key = service || anon;
      // Direct REST insert to avoid adding @supabase/supabase-js dependency
      const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rw_events`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          event: enriched.event,
          props: enriched.props,
          ts: enriched.ts,
          url: enriched.url,
          ip: enriched.ip,
          ua: enriched.ua?.slice(0, 500),
          utm_source: enriched.utm_source,
          utm_campaign: enriched.utm_campaign,
        }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.warn("[analytics] supabase insert failed", res.status, t.slice(0, 300));
      }
    } catch (e: any) {
      console.warn("[analytics] supabase error", e?.message || e);
    }
  }

  return NextResponse.json({ ok: true });
}

// GET for simple funnel stats (used by /api/analytics/stats)
export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, message: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel env" });
  }
  try {
    const { url, service, anon } = getSupabaseEnv();
    const key = service || anon;
    const { searchParams } = new URL(req.url);
    const days = Math.min(90, Math.max(1, Number(searchParams.get("days") || "7")));
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

    // Fetch aggregated counts via postgrest - we do client-side agg to keep SQL simple
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rw_events?select=event,ts,utm_campaign&ts=gte.${encodeURIComponent(since)}&order=ts.desc&limit=5000`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return NextResponse.json({ error: "supabase fetch failed", status: res.status, body: t.slice(0, 500) }, { status: 500 });
    }
    const rows: Array<{ event: string; ts: string; utm_campaign: string | null }> = await res.json();
    const counts: Record<string, number> = {};
    const byCampaign: Record<string, Record<string, number>> = {};
    const byDay: Record<string, Record<string, number>> = {};
    for (const r of rows) {
      counts[r.event] = (counts[r.event] || 0) + 1;
      const camp = r.utm_campaign || "organic";
      if (!byCampaign[camp]) byCampaign[camp] = {};
      byCampaign[camp][r.event] = (byCampaign[camp][r.event] || 0) + 1;
      const day = (r.ts || "").slice(0, 10);
      if (day) {
        if (!byDay[day]) byDay[day] = {};
        byDay[day][r.event] = (byDay[day][r.event] || 0) + 1;
      }
    }
    const totalViews = counts["page_view"] || 0;
    const totalCalc = counts["calculation_completed"] || 0;
    const totalClicks = counts["provider_clicked"] || 0;
    const totalEmails = counts["email_submitted"] || 0;
    const clickRate = totalCalc ? Math.round((totalClicks / totalCalc) * 1000) / 10 : 0;

    return NextResponse.json({
      configured: true,
      days,
      since,
      total_rows: rows.length,
      counts,
      funnel: {
        page_view: totalViews,
        calculation_completed: totalCalc,
        provider_clicked: totalClicks,
        email_submitted: totalEmails,
        click_rate_percent: clickRate,
        target_ge_8_percent: clickRate >= 8,
      },
      byCampaign,
      byDay,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
