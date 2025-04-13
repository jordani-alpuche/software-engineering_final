"use server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

/*
 ** @description: This function retrieves a specific visitor feedback from the database using its ID.
 ** @param {number} id - The ID of the feedback to retrieve.
 ** @returns: The visitor feedback object or null if not found.
 */

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

/*
 ** @description: This function retrieves all visitor feedback from the database.
 ** @returns: An array of visitor feedback or an error message.
 ** @throws: Error if the database query fails.
 */

export async function getAllVisitorFeedback() {
  const feedback = await prisma.visitor_feedback.findMany({
    include: {
      visitors_schedule: true,
    },
  });

  return feedback || null;
}
