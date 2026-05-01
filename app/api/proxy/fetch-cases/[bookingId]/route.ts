import { NextRequest, NextResponse } from "next/server";

const DEV_SESSION = process.env.DEV_SESSION || "";
const DEV_TOKEN = process.env.DEV_TOKEN || "";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;
  const isDevelopment = process.env.NODE_ENV === "development";

  const headers: HeadersInit = {
    "Content-Type": "text/plain;charset=UTF-8",
  };

  if (isDevelopment) {
    headers["Cookie"] = `session=${DEV_SESSION}`;
    headers["Authorization"] = `Bearer ${DEV_TOKEN}`;
  }

  try {
    // const test_bookig_id = "4641740590940160";
    // const url = `https://aperfectstay.ai/api/aperfect10/pms/fetch-cases/${bookingId}`;
    // const response = await fetch(
    //   `https://aperfectstay.ai/api/aperfect10/pms/fetch-cases/${bookingId}`,
    //   { method: "POST", headers },
    // );
    const url = `https://aperfectstay.ai/api/aperfect10/pms/fetch-cases/${bookingId}`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: "fd",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch cases" },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log("data in the fetch-cases api---- ", data, "url ---- ", url);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 },
    );
  }
}
