import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export async function POST(req: NextRequest) {
  try {
    const {
      resident_id,
      visitor_name,
      visitor_phone,
      visitor_id_type,
      visitor_id_number,
      visitor_email,
      visit_date_start,
      visit_date_end,
      status,
      type,
      visit_start_time,
      visit_end_time,
    } = await req.json();

    // Validate all required fields
    if (
      !resident_id ||
      !visitor_name ||
      !visitor_phone ||
      !visitor_id_type ||
      !visitor_id_number ||
      !visitor_email ||
      !visit_date_start ||
      !visit_date_end ||
      !status ||
      !type ||
      !visit_start_time ||
      !visit_end_time
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Check if the username already exists
    // const existingUser = await prisma.users.findUnique({
    //   where: { username },
    // });

    // if (existingUser) {
    //   return NextResponse.json(
    //     { error: "taken" },
    //     { status: 409 } // Conflict status code
    //   );
    // }

    // Hash the password
    const qr_code = "1234567890";

    // Create the new visitior
    const visitor = await prisma.visitors.create({
      data: {
        resident_id: resident_id,
        visitor_name: visitor_name,
        visitor_phone: visitor_phone,
        visitor_id_type: visitor_id_type,
        visitor_id_number: visitor_id_number,
        visitor_email: visitor_email,
        visit_date_start: visit_date_start,
        visit_date_end: visit_date_end,
        status: status,
        type: type,
        visit_start_time: visit_start_time,
        visit_end_time: visit_end_time,
        qr_code: qr_code,
      },
    });

    // Return the created user data as a response
    return NextResponse.json({ visitor }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
