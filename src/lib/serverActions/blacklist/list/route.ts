"use server";
import { PrismaClient } from "@prisma/client";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file

const prisma = new PrismaClient();

/*
 ** @description: This function retrieves all blacklisted visitors from the database.
 ** @returns: An array of blacklisted visitors or an error message.
 ** @throws: Error if the database query fails.
 */
export async function blacklistInfo() {
  const session = await getServerSession(authOptions); // Get the session to check user authentication
  const userid = Number(session?.user.id); // Get the user ID from the session
  try {
    const blacklist = await prisma.blacklist_visitors.findMany({
      include: {
        visitiors: true,
      },
    });
    return blacklist; // Return the list of blacklisted visitors
  } catch (error) {
    return error;
  }
}

/*
 ** @description: This function retrieves a specific blacklisted visitor from the database using their ID.
 ** @param {number} vid - The ID of the visitor to retrieve.
 ** @returns: The blacklisted visitor object or null if not found.
 ** @throws: Error if the database query fails.
 */

export async function getblacklistInfo(vid: number) {
  const session = await getServerSession(authOptions);
  const userid = Number(session?.user.id);
  try {
    const blacklist = await prisma.blacklist_visitors.findUnique({
      where: {
        visitor_id: Number(vid),
      },
      include: {
        visitiors: true,
      },
    });
    return blacklist || null; // Return null if not found
  } catch (error) {
    // Handle any errors that occur during the database query
    return error;
  }
}
