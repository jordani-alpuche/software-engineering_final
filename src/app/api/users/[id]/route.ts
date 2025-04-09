"use server";
// import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// import { bcrypt } from "bcryptjs";
import { hashPassword } from "@/app/utils/hashPassword"; // Adjust path if necessary

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Fetch a user by ID
export async function getUsers(id: number) {
  const user = await prisma.users.findUnique({
    where: { id: Number(id) },
  });

  return user || null; // Return user object or null if not found
}

// Update a user by ID
export async function updateUser(id: number, data: any) {
  const userData = { ...data };

  const currentUser = await prisma.users.findUnique({
    where: { id },
  });

  if (!currentUser) {
    return {
      success: false,
      code: 404,
      message: "User not found",
    };
  }

  // Validate required fields
  if (!userData.username) {
    return {
      success: false,
      code: 400,
      message: "Username, role is required.",
    };
  }

  // Hash password if changed
  let hashedPassword = currentUser.password;
  if (data.password && data.password !== currentUser.password) {
    hashedPassword = await hashPassword(data.password);
  }

  try {
    // Update user record

    if (userData.role === "admin" || userData.role === "resident") {
      userData.shift = "";
      userData.accesspoints = "";
    }
    if (userData.role === "admin") {
      userData.first_name = "";
      userData.last_name = "";
      userData.email = "";
      userData.phone_number = "";
      userData.address = "";
      userData.house_number = "";
    }
    userData.password = hashedPassword;
    const updatedUser = await prisma.users.update({
      where: { id: Number(id) },
      data: userData,
    });

    return {
      success: true,
      code: 200,
      message: "User updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      code: 500,
      message: "Server error: " + error.message,
    };
  }
}

// Delete a user by ID
export async function deleteUser(id: number) {
  try {
    await prisma.users.delete({
      where: { id: Number(id) },
    });

    return { message: "User deleted successfully", success: true };
  } catch (error) {
    throw new Error("Error deleting user");
  }
}
