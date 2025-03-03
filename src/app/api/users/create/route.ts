import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/app/utils/hashPassword"; // Adjust the import as necessary

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const {
      resident_first_name,
      resident_last_name,
      resident_house_number,
      resident_address,
      resident_phone_number,
      security_first_name,
      security_last_name,
      security_phone_number,
      security_shift,
      username,
      password,
      role,
      status,
    } = await req.json();

    if (role === "resident") {
      if (
        !resident_first_name ||
        !resident_last_name ||
        !resident_house_number ||
        !resident_address ||
        !resident_phone_number ||
        !username ||
        !password ||
        !role ||
        !status
      ) {
        return NextResponse.json(
          { error: "All fields are required." },
          { status: 400 }
        );
      }
    }
    if (role === "security") {
      if (
        !security_first_name ||
        !security_last_name ||
        !security_phone_number ||
        !security_shift ||
        !username ||
        !password ||
        !role ||
        !status
      ) {
        return NextResponse.json(
          { error: "All fields are required." },
          { status: 400 }
        );
      }
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
    // const user = await prisma.users.create({
    //   data: {
    //     username,
    //     password: hashedPassword,
    //     role,
    //     status: status,
    //   },
    // });

    // Return the created user data as a response
    return NextResponse.json({ hashPassword }, { status: 201 });
    // return "User created successfully";
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
