"use server";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/app/utils/hashPassword"; // Adjust the import as necessary

const prisma = new PrismaClient();

export async function createUser(data: any) {
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
