import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Admin anomaly review is pending PocketBase migration." },
    { status: 501 },
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Admin anomaly review is pending PocketBase migration." },
    { status: 501 },
  );
}
