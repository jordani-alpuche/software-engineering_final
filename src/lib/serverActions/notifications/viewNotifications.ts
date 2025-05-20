"use server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function getAllUnReadNotifications() {
  const notifications = await prisma.notifications.findMany({
    where: {status: "unread"},
    take: 10,
        orderBy: {
      created_at: "desc",
    },
  });

  return notifications || null;
}

export async function markNotificationAsRead(notificationId: number) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      success: false,
      code: 401,
      message: "Unauthorized",
    };
  }

  try {
    await prisma.notifications.update({
      where: {
        id: notificationId,
      },
      data: {
        status: "read",
      },
    });
    return { success: true, code: 200, message: "Notification marked as read." };
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return { success: false, code: 500, message: "Server error: " + error.message };
  }
}

export async function markAllNotificationsAsRead(userId: number) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      success: false,
      code: 401,
      message: "Unauthorized",
    };
  }

  try {
    await prisma.notifications.updateMany({
      where: {
        user_id: userId,
        status: "unread",
      },
      data: {
        status: "read",
      },
    });
    return { success: true, code: 200, message: "All notifications marked as read." };
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, code: 500, message: "Server error: " + error.message };
  }
}