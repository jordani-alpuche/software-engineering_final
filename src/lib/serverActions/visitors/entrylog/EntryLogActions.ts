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

export async function visitorsLog() {
  const session = await getServerSession(authOptions);
  const userid = Number(session?.user.id);

  if (!session) {
    return {
      success: false,
      code: 401,
      message: "Unauthorized",
    };
  }

  const role = session.user.role;

  // Optional: Allow only certain roles
  if (!["admin","security","resident"].includes(role)) {
    return {
      success: false,
      code: 403,
      message: "Forbidden: You do not have permission",
    };
  }


  try {
    const visitors = await prisma.visitor_entry_logs.findMany({      
             where: {
        ...(role === "resident" && {
          visitors_schedule: {
            resident_id: userid,
          },
        }),
      },
      include: { visitiors: true, visitors_schedule:true}, // Include visitor details
    });
    // console.log("Visitors Logs", visitors);
    return visitors;
  } catch (error) {
    return error;
  }
}
