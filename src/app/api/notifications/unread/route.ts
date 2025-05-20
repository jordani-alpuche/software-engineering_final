// src/app/api/notifications/unread/route.ts
import { NextResponse } from "next/server";
import { getAllUnReadNotifications } from "@/lib/serverActions/notifications/viewNotifications";

export async function GET() {
  try {
    const notifications = await getAllUnReadNotifications();
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}