import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function getAccessPoints() {
  // try {

  // Fetch access points from the database

  return await prisma.access_points.findMany();

  //   return NextResponse.json(access_points, { status: 200 });
  // } catch (error) {
  //   console.error("Error fetching access points:", error);
  //   return NextResponse.json(
  //     { error: "Failed to fetch Access Points" },
  //     { status: 500 }
  //   );
  // }
}
