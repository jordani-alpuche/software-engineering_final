"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export async function BlacklistVisitorAPI(data: any) {
  try {
    console.log("Data received:", data); // Log the incoming data
    // Validate required fields
    if (
      // !data.id ||
      !data.reason ||
      !data.status ||
      !data.type ||
      !data.resident_id ||
      !data.visitor_id
      //   !data.security_id||
    ) {
      return {
        success: false,
        code: 400,
        message: "Missing required fields" + JSON.stringify(data),
      };
    }

    // Start a transaction to create both visitor and schedule
    const result = await prisma.$transaction(async (tx) => {
      let blacklistVisitor;
      if (data.type === "true") {
        // Create visitor schedule first
        blacklistVisitor = await tx.blacklist_visitors.create({
          data: {
            resident_id: data.resident_id,
            security_id: data.security_id,
            visitor_id: data.visitor_id,
            reason: data.reason,
            status: data.status,
          },
        });
      } else if (data.type === "false") {
        blacklistVisitor = await tx.blacklist_visitors.update({
          where: {
            id: data.id,
          },
          data: {
            reason: data.reason,
          },
        });
      }

      return blacklistVisitor;
    });

    return {
      success: true,
      code: 200,
      message: "Blacklist Visitor created successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      code: 500,
      message: "Server error: " + error.message,
    };
  }
}
