import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/app/utils/hashPassword"; // Adjust the import as necessary

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const transaction = await prisma.$transaction(async (prisma) => {
    try {
      const {
        //Resident fields
        resident_email,
        resident_first_name,
        resident_last_name,
        resident_house_number,
        resident_address,
        resident_phone_number,
        //Security fields
        security_first_name,
        security_last_name,
        security_email,
        security_phone_number,
        security_address,
        security_shift,
        security_access_point,
        //user fields
        username,
        password,
        role,
        status,
      } = await req.json();

      // Validate inputs based on role
      if (role === "resident") {
        if (
          !resident_first_name ||
          !resident_last_name ||
          !resident_house_number ||
          !resident_address ||
          !resident_phone_number ||
          !resident_email
        ) {
          return NextResponse.json(
            { error: "All Resident fields are required." },
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
          !security_access_point ||
          !security_email ||
          !security_address
        ) {
          return NextResponse.json(
            { error: "All Security fields are required." },
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
          { error: "Username is taken" },
          { status: 409 }
        );
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create the new user record
      const user = await prisma.users.create({
        data: {
          username,
          password: hashedPassword,
          role,
          status,
        },
      });

      let residentData = null;
      let securityData = null;

      if (role === "resident") {
        // Insert resident-specific data
        residentData = await prisma.resident.create({
          data: {
            resident_email,
            resident_first_name,
            resident_last_name,
            resident_house_number,
            resident_address,
            resident_phone_number,
            resident_qr_code: "qr_code", // Generate a QR code here
            user_id: user.id, // Link to the user table
          },
        });
      } else if (role === "security") {
        // Insert security-specific data
        securityData = await prisma.security.create({
          data: {
            security_first_name,
            security_last_name,
            security_email,
            security_phone_number,
            security_address,
            security_shift,
            security_access_point: security_access_point,
            security_qr_code: "qr_code", // Generate a QR code here
            user_id: user.id, // Link to the user table
          },
        });
      }

      // Return the created user data as a response
      return NextResponse.json(
        { user: user, status: "success" },
        { status: 201 }
      );
    } catch (error) {
      console.error(error);
      // If any error happens inside the transaction block, it will automatically be rolled back
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });

  // Prisma handles the commit or rollback automatically based on success or failure
  return transaction;
}
