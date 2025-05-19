"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/*
 ** @swagger
 ** APi to create or update a visitor in the blacklist
 ** @param {object} data - The data for creating or updating the visitor.
 ** @param {number} data.id - The ID of the visitor to be updated (optional).
 ** @param {string} data.reason - The reason for blacklisting the visitor.
 */

export async function BlacklistVisitorAPI(data: any) {
  try {
    // console.log("Data received:", data); // Log the incoming data
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
      // Check if required fields are present
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
        // Check if the type is "true" for creation
        // Create visitor schedule first
        blacklistVisitor = await tx.blacklist_visitors.create({
          data: {
            resident_id: data.resident_id,
            security_id: data.security_id,
            visitor_id: data.visitor_id,
            reason: data.reason,
            status: data.status,
          },
        }); // Create the visitor schedule
      } else if (data.type === "false") {
        // Check if the type is "false" for update
        blacklistVisitor = await tx.blacklist_visitors.update({
          where: {
            id: data.id,
          },
          data: {
            reason: data.reason,
          },
        }); // Update the visitor schedule
      }

      return blacklistVisitor; // Return the created or updated visitor schedule
    });

    return {
      success: true,
      code: 200,
      message: "Blacklist Visitor created successfully",
    }; // Return success message
  } catch (error: any) {
    // Handle errors
    return {
      success: false,
      code: 500,
      message: "Server error: " + error.message,
    }; // Return error message
  }
}
