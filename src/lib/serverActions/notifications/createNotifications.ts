// src/lib/serverActions/notifications/createNotification.ts
"use server";

import { prisma } from "@/lib/prisma";

interface CreateNotificationParams {
  userId: number;
  message: string;
  type: string; // extendable types
}

export async function CreateNotification({
  userId,
  message,
  type,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notifications.create({
      data: {
        user_id: userId,
        message,
        type,
        status: "unread",
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error("❌ Notification creation failed:", error);
    return { success: false, error: "Failed to create notification" };
  }
}
