import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/app/utils/hashPassword"; // Adjust the import as necessary

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const {
      first_name,
      last_name,
      username,
      password,
      phone,
      role,
      unit,
      status,
    } = await req.json();

    // Validate all required fields
    if (
      !first_name ||
      !last_name ||
      !username ||
      !password ||
      !phone ||
      !role ||
      !unit
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Check if the username already exists
    const existingUser = await prisma.users.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "taken" },
        { status: 409 } // Conflict status code
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the new user
    const user = await prisma.users.create({
      data: {
        first_name,
        last_name,
        username,
        password: hashedPassword,
        phone,
        role,
        unit_number: unit,
        status: status,
      },
    });

    // Return the created user data as a response
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
