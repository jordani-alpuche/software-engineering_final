"use server";
import { PrismaClient } from "@prisma/client";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file

const prisma = new PrismaClient();

/*
 ** @swagger
 ** APi to delete a visitor from the blacklist
 ** @param {number} id - The ID of the visitor to be deleted.
 ** @returns {object} - A success message or an error message.
 ** @throws {Error} - Throws an error if the deletion fails.
 ** @throws {Error} - Throws an error if the user is unauthorized.
 ** @throws {Error} - Throws an error if the visitor ID is invalid.
 */
export async function deleteBlacklistVisitor(id: number) {

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
  if (!["admin"].includes(role)) {
    return {
      success: false,
      code: 403,
      message: "Forbidden: You do not have permission",
    };
  }

  
  try {
    console.log("Data id received:", id); // Log the incoming data
    const session = await getServerSession(authOptions); // Get the session
    const userid = Number(session?.user?.id); // Get the user ID from the session

    if (!userid) {
      // Check if the user ID is valid
      return {
        success: false,
        code: 401,
        message: "Unauthorized",
      };
    }
    /*
     ** @swagger
     ** @description Delete a visitor from the blacklist.
     ** @param {number} id - The ID of the visitor to be deleted.
     ** Start a transaction to ensure data integrity.
     */
    await prisma.$transaction(async (tx) => {
      // Delete visitor first (to maintain foreign key constraints)

      // Delete schedule
      await tx.blacklist_visitors.delete({
        where: {
          id: Number(id),
        },
      });
    });

    return {
      message: "Schedule deleted successfully",
      success: true,
    }; // Return success message
  } catch (error) {
    throw new Error("Error deleting schedule"); // Handle errors
  }
}
