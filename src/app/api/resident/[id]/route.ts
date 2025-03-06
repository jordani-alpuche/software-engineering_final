import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Handler to fetch a resident by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    const { id } = await params;
    const resident = await prisma.resident.findUnique({
      where: { user_id: id },
    });

    if (!resident) {
      return NextResponse.json(
        { error: "resident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(resident, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching resident" },
      { status: 500 }
    );
  }
}

// Handler to update a resident by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    const { id } = await params;

    // Parse request body data
    const residentData = await req.json();

    if (!residentData || typeof residentData !== "object") {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }

    // Log the data for debugging
    console.log("Request body data:", residentData, "ID:", id);

    // Perform the update
    const updatedResident = await prisma.resident.update({
      where: { user_id: Number(id) },
      data: residentData, // Update the resident with the provided data
    });

    return NextResponse.json(updatedResident, { status: 200 });
  } catch (error) {
    console.error("Error updating resident:", error);
    return NextResponse.json(
      { error: "Error updating resident" },
      { status: 500 }
    );
  }
}

// Handler to delete a resident by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.resident.delete({
      where: { user_id: Number(params.id) },
    });

    return NextResponse.json(
      { message: "resident deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting resident" },
      { status: 500 }
    );
  }
}
