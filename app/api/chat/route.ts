import { NextResponse } from "next/server";
import { findBestResponse } from "../../../lib/matcher";

export async function POST(req: Request) {
  const { message } = await req.json();
  const reply = findBestResponse(message);

  return NextResponse.json({ reply });
}