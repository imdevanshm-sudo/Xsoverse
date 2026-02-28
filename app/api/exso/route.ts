import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Exso } from "../../../lib/types";

export const runtime = "nodejs";

const SHARE_DIR = path.join("/tmp", "xso-share");

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<Exso>;
    if (!payload?.id) {
      return NextResponse.json({ error: "Missing exso id" }, { status: 400 });
    }
    await mkdir(SHARE_DIR, { recursive: true });
    const filePath = path.join(SHARE_DIR, `${payload.id}.json`);
    await writeFile(filePath, JSON.stringify(payload), "utf8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to save exso" }, { status: 500 });
  }
}
