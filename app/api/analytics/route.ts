import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try { const body = await req.json(); console.log("[analytics]", body); } catch {}
  return NextResponse.json({ ok: true });
}
