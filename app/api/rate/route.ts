import { NextResponse } from "next/server";

// Primary: Frankfurter (ECB) https://www.frankfurter.app/docs/  -> /latest?from=SGD&to=MYR
// Fallback: fawazahmed0 currency-api  https://github.com/fawazahmed0/currency-api
// Fallback 2: static indicative

const FALLBACK_RATE = 3.42; // indicative SGD->MYR, clearly labelled as indicative if used

export async function GET() {
  // Try Frankfurter
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://api.frankfurter.app/latest?from=SGD&to=MYR", {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(t);
    if (res.ok) {
      const data = await res.json();
      const rate = data?.rates?.MYR;
      if (typeof rate === "number" && rate > 0) {
        return NextResponse.json({
          rate,
          source: "Frankfurter (ECB)",
          lastUpdated: data.date || new Date().toISOString().slice(0, 10),
          live: true,
        });
      }
    }
  } catch (e) {
    console.warn("Frankfurter failed", e);
  }

  // Fallback: fawazahmed0
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/sgd.json", {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(t);
    if (res.ok) {
      const data = await res.json();
      const rate = data?.sgd?.myr;
      if (typeof rate === "number" && rate > 0) {
        return NextResponse.json({
          rate,
          source: "fawazahmed0/currency-api (CC0)",
          lastUpdated: data.date || new Date().toISOString().slice(0, 10),
          live: true,
        });
      }
    }
  } catch (e) {
    console.warn("fawazahmed0 failed", e);
  }

  // Final fallback: indicative static
  return NextResponse.json({
    rate: FALLBACK_RATE,
    source: "Indicative reference (fallback)",
    lastUpdated: new Date().toISOString().slice(0, 10),
    live: false,
  });
}
