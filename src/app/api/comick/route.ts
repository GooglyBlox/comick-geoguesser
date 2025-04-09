import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const limit = url.searchParams.get("limit") || "50";

  try {
    const response = await fetch(
      `https://api.comick.io/v1.0/search?limit=${limit}&page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Failed to parse response data" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from comick API:", error);
    return NextResponse.json(
      { error: "Failed to fetch comics data" },
      { status: 500 }
    );
  }
}
