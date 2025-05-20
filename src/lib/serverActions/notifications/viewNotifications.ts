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