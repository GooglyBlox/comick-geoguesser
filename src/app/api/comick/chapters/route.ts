import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const hid = url.searchParams.get("hid");
  const limit = url.searchParams.get("limit") || "10";

  if (!hid) {
    return NextResponse.json(
      { error: "HID parameter is required" },
      { status: 400 }
    );
  }

  try {
    const endpoints = [
      `https://api.comick.fun/comic/${hid}/chapters?limit=${limit}&chap-order=1`,
    ];
    
    let responseData = null;
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const text = await response.text();
        if (!text) {
          continue;
        }

        responseData = JSON.parse(text);
        if (responseData && (responseData.chapters?.length > 0 || responseData.length > 0)) {
          break;
        }
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, error);
        lastError = error;
      }
    }
    
    if (responseData) {
      return NextResponse.json(responseData);
    }
    
    throw lastError || new Error("Failed to fetch chapters from all endpoints");
  } catch (error) {
    console.error("Error fetching chapters data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters data. Please try again." },
      { status: 500 }
    );
  }
}