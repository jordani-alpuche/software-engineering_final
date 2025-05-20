"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

/**
 * API to create or update a visitor in the blacklist.
 * @param {object} data - The data for creating or updating the visitor.
 * @param {number} [data.id] - The ID of the blacklist entry (for update).
 * @param {string} data.reason - Reason for blacklisting.
 * @param {string} data.status - Status of the blacklist entry.
 * @param {string} data.type - "create" or "update".
 * @param {number} data.resident_id - Resident ID.
 * @param {number} data.security_id - Security Guard ID.
 * @param {number} data.visitor_id - Visitor ID.
 */
export async function BlacklistVisitorAPI(data: any) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      success: false,
      code: 401,
      message: "Unauthorized",
    };
  }

  const role = session.user.role;

  // Optional: Allow only certain roles
  if (!["resident", "security","admin"].includes(role)) {
    return {
      success: false,
      code: 403,
      message: "Forbidden: You do not have permission",
    };
  }

  // Validate basic structure
  if (!data.reason || !data.status || !data.type || !data.resident_id || !data.visitor_id) {
    return {
      success: false,
      code: 400,
      message: "Missing required fields: reason, status, or type",
    };
  }

  // For creation, require visitor_id, resident_id, and security_id
  const isCreating = data.type === "true";
  if (isCreating && (!data.visitor_id || !data.resident_id )) {
    return {
      success: false,
      code: 400,
      message: "Missing required fields for creation",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let blacklistVisitor;

      if (isCreating) {
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
        if (!data.id) {
          return null;
        }

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

    if (!result) {
      return {
        success: false,
        code: 400,
        message: "Invalid operation or missing ID",
      };
    }

    return {
      success: true,
      code: 200,
      message: `Blacklist visitor ${isCreating ? "created" : "updated"} successfully`,
    };
  } catch (error: any) {
    return {
      success: false,
      code: 500,
      message: "Server error: " + error.message,
    };
  }
}
