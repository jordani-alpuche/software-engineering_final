import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Auth logic is moved to a separate file

const prisma = new PrismaClient();

/*
  @description: 
  This function retrieves the visitor entry logs from the database.
  It uses the Prisma client to query the visitor_entry_logs table.
  It includes the visitor details in the response.
  It returns an array of visitor entry logs or an error message.
*/

export async function visitorsInfo() {
  const session = await getServerSession(authOptions);
  const userid = Number(session?.user.id);
  try {
    const visitors = await prisma.visitors_schedule.findMany({
      where: {
        resident_id: userid,
      },
      include: { visitiors: true }, // Include visitor details
      orderBy: { visitor_entry_date: "desc" }, // Order by visitor entry date in descending order
    });
    return visitors;
  } catch (error) {
    return error;
  }
}
