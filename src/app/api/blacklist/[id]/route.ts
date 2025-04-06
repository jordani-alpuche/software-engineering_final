"use server";
import { PrismaClient } from "@prisma/client";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
export async function deleteBlacklistVisitor(id: number) {
  try {
    console.log("Data id received:", id); // Log the incoming data
    const session = await getServerSession(authOptions);
    const userid = Number(session?.user?.id);

    if (!userid) {
      return {
        success: false,
        code: 401,
        message: "Unauthorized",
      };
    }
    await prisma.$transaction(async (tx) => {
      // Delete visitor first (to maintain foreign key constraints)

      // Delete schedule
      await tx.blacklist_visitors.delete({
        where: {
          id: Number(id),
        },
      });
    });

    return { message: "Schedule deleted successfully", success: true };
  } catch (error) {
    throw new Error("Error deleting schedule");
  }
}
