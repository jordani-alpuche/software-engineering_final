import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { hashPassword } from "@/app/utils/hashPassword"; // Adjust path as necessary

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Handler to fetch a user by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: Number } }
) {
  try {
    const { id } = await params;
    const user = await prisma.users.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}

// Handler to update a user by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    const { id } = await params;

    // Parse request body data
    const userData = await req.json();

    if (!userData || typeof userData !== "object") {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }

    // Log the data for debugging
    console.log("Request body data:", userData, "ID:", id);

    // Fetch the current user data from the database
    const currentUser = await prisma.users.findUnique({
      where: { id: Number(id) },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the password provided in the request is different from the stored one
    if (userData.password && userData.password !== currentUser.password) {
      // Hash the new password
      const hashedPassword = await hashPassword(userData.password);

      // Update the user's password in the request data
      userData.password = hashedPassword; // Replace password with hashed value
    }

    // Perform the update
    const updatedUser = await prisma.users.update({
      where: { id: Number(id) },
      data: userData, // Update the user with the provided data
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}

// Handler to delete a user by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.users.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}
