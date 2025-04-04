import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file

const prisma = new PrismaClient();

export async function visitorsLog() {
  const session = await getServerSession(authOptions);
  const userid = Number(session?.user.id);
  try {
    const visitors = await prisma.visitor_entry_logs.findMany({
      //   where: {
      //     resident_id: userid,
      //   },
      include: { visitiors: true }, // Include visitor details
    });
    // console.log("Visitors Logs", visitors);
    return visitors;
  } catch (error) {
    return error;
  }
}
