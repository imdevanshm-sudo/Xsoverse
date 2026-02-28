import { NextResponse } from "next/server";
import { isCheckoutVerified } from "../../../../lib/lemonsqueezy";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nonce = url.searchParams.get("nonce") ?? "";
  if (!nonce) {
    return NextResponse.json({ verified: false });
  }
  const verified = await isCheckoutVerified(nonce);
  return NextResponse.json({ verified });
}
