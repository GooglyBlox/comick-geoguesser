import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const hid = url.searchParams.get("hid");

  if (!hid) {
    return NextResponse.json(
      { error: "HID parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.comick.fun/chapter/${hid}/get_images`,
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
      return NextResponse.json({ images: [] }, { status: 200 });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Failed to parse images data" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching images data:", error);
    return NextResponse.json(
      { error: "Failed to fetch images data" },
      { status: 500 }
    );
  }
}
