import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.comick.io/genre/", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      return NextResponse.json([], { status: 200 });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Failed to parse genre data" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching genre data:", error);
    return NextResponse.json(
      { error: "Failed to fetch genre data" },
      { status: 500 }
    );
  }
}
