import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Handler to fetch a security by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: Number } }
) {
  try {
    const { id } = await params;
    const security = await prisma.security.findUnique({
      where: { user_id: Number(id) },
    });

    if (!security) {
      return NextResponse.json(
        { error: "security not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(security, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching security" },
      { status: 500 }
    );
  }
}

// Handler to update a security by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    const { id } = await params;

    // Parse request body data
    const securityData = await req.json();

    if (!securityData || typeof securityData !== "object") {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }

    // Log the data for debugging
    console.log("Request body data:", securityData, "ID:", id);

    // Fetch the current security data from the database
    const currentSecurity = await prisma.security.findUnique({
      where: { user_id: Number(id) },
    });

    if (!currentSecurity) {
      return NextResponse.json(
        { error: "security not found" },
        { status: 404 }
      );
    }

    // Perform the update
    const updatedSecurity = await prisma.security.update({
      where: { user_id: Number(id) },
      data: securityData, // Update the security with the provided data
    });

    return NextResponse.json(updatedSecurity, { status: 200 });
  } catch (error) {
    console.error("Error updating security:", error);
    return NextResponse.json(
      { error: "Error updating security" },
      { status: 500 }
    );
  }
}

// Handler to delete a security by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.security.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json(
      { message: "security deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting security" },
      { status: 500 }
    );
  }
}
