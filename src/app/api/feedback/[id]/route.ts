"use server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export async function getVisitorSchedule(id: number) {
  const session = await getServerSession(authOptions);
  const userid = session?.user.id;

  const feedback = await prisma.visitor_feedback.findFirst({
    where: { visitor_schedule_id: Number(id) },
  });

  if (feedback) {
    return "exists";
  }

  const schedule = await prisma.visitors_schedule.findUnique({
    where: { id: Number(id) },
    include: {
      visitiors: true,
      visitor_entry_logs: true,
    },
  });

  return schedule || null;
}

export async function getAllVisitorFeedback() {
  const feedback = await prisma.visitor_feedback.findMany({
    include: {
      visitors_schedule: true,
    },
  });

  return feedback || null;
}
