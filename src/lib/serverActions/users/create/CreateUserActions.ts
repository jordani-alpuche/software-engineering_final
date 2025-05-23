"use server";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/app/utils/hashPassword"; // Adjust the import as necessary
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authentication logic

const prisma = new PrismaClient();

/*
 ** @description: This function creates a new user in the database.
 ** the data is passed to the user as a parameter.
 ** @param {object} data - The user data to be created.
 ** verifies if the username is taken already
 ** hashes the password before storing it in the database.
 ** @returns: An object containing the success status, HTTP status code, and message.
 */

export async function createUser(data: any) {

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
    // Check if the username already exists
    const existingUser = await prisma.users.findUnique({
      where: { username: data.username },
    });
    if (existingUser) {
      return {
        success: false,
        code: 409,
        message: "taken",
      };
    }
    // Hash the password
    const hashedPassword = await hashPassword(data.password);
    data.password = hashedPassword;
    // Create the new user record
    const user = await prisma.users.create({
      data: data,
    });

    return {
      success: true,
      code: 201,
      message: "User created successfully",
    };
  } catch (error) {
    return {
      success: false,
      code: 500,
      message: "Internal Server Error",
    };
  }
}
