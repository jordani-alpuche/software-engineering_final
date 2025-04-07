"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export async function createVisitorFeedback(data: any) {
  console.log("createVisitorFeedback", data);
  try {
    if (!data.scheduleId || !data.rating || !data.comments) {
      return {
        success: false,
        code: 400,
        message: "Missing required fields or invalid visitors list",
      };
    }

    const feedback = await prisma.$transaction(async (tx) => {
      return await tx.visitor_feedback.create({
        data: {
          visitor_schedule_id: data.scheduleId,
          rating: data.rating,
          comments: data.comments,
        },
      });
    });

    return {
      success: true,
      code: 200,
      message: "Visitor feedback created successfully",
      data: feedback,
    };
  } catch (error: any) {
    console.error("Error in Visitor Feedback:", error);
    return {
      success: false,
      code: 500,
      message: "Server error: " + error.message,
    };
  }
}
