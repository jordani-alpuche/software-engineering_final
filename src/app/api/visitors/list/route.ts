import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const visitors = await prisma.visitors.findMany();
    return NextResponse.json(visitors, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch visitors" },
      { status: 500 }
    );
  }
}
