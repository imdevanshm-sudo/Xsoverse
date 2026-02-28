import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const SHARE_DIR = path.join("/tmp", "xso-share");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing exso id" }, { status: 400 });
  }
  try {
    const filePath = path.join(SHARE_DIR, `${id}.json`);
    const raw = await readFile(filePath, "utf8");
    return new NextResponse(raw, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Exso not found" }, { status: 404 });
  }
}
