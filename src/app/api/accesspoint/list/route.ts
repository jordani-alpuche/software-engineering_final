import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get the JWT token from the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure token has an expiration time (exp) and is a number
    if (
      typeof token.exp !== "number" ||
      token.exp < Math.floor(Date.now() / 1000)
    ) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Fetch access points from the database
    const access_points = await prisma.access_points.findMany();

    return NextResponse.json(access_points, { status: 200 });
  } catch (error) {
    console.error("Error fetching access points:", error);
    return NextResponse.json(
      { error: "Failed to fetch Access Points" },
      { status: 500 }
    );
  }
}
