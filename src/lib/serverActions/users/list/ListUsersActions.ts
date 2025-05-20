import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authentication logic


const prisma = new PrismaClient();

/*
 ** @description: This function retrieves all users from the database.
 ** @returns: An array of users or an error message.
 ** @throws: Error if the database query fails.
 */

export async function usersInfo() {
    const session = await getServerSession(authOptions);
  const userid = Number(session?.user.id);
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
  // Fetch all users
  try {
    const users = await prisma.users.findMany();
    return users;
  } catch (error) {
    return error;
  }
}
