import { NextResponse } from "next/server";
import { recordActivity, getActivityState } from "@/lib/activity";

export async function GET() {
  const state = getActivityState();
  return NextResponse.json({ success: true, state });
}

export async function POST() {
  const state = recordActivity();
  return NextResponse.json({ success: true, state });
}
