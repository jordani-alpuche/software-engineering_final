"use server";
// import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authOptions from your auth configuration

// total active visitor schedule, count total visitors by each year,count total visitor by current year and month,
export async function getTotalActiveVisitors() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        const role = session?.user?.role;

        if (!userId) {
        throw new Error("User not authenticated");
        }
    
        const totalActiveVisitorsSchedule = await prisma.visitors_schedule.count({
        where: {
            status: "active",
            ...(role === "resident" && { resident_id: Number(userId) }),
        },
        });   

    
        return {
        totalActiveVisitorsSchedule,
        };
    } catch (error) {
        console.error("Error fetching visitor statistics:", error);
        throw new Error("Failed to fetch visitor statistics");
    }

}

export async function getTotalUnActiveVisitors() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        const role = session?.user?.role;

        if (!userId) {
        throw new Error("User not authenticated");
        }
    
        const totalInActiveVisitorsSchedule = await prisma.visitors_schedule.count({
        where: {
            status: "inactive",
            ...(role === "resident" && { resident_id: Number(userId) }),
        },
        });   

    
        return {
        totalInActiveVisitorsSchedule,
        };
    } catch (error) {
        console.error("Error fetching visitor statistics:", error);
        throw new Error("Failed to fetch visitor statistics");
    }

}

interface VisitorCountByYear {
  year: number;
  count: number;
}


export async function getVisitorCountByYear(): Promise<{ success: boolean; data?: VisitorCountByYear[]; message?: string }> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, message: "Unauthorized" };
  }

  const userId = Number(session.user.id);
  const userRole = session.user.role; // Assuming 'role' is part of your session.user object

  try {
    let whereClause: any = {};

    // If the user is not an admin, filter by their resident_id
    if (userRole !== "admin") {
      whereClause = {
        resident_id: userId,
      };
    }

    // Use Prisma's `groupBy` and aggregate functions
    // We need to extract the year from the `created_at` or `visitor_entry_date` field.
    // For this, we'll use a raw query or a computed field in Prisma if your database supports it directly.
    // However, Prisma's `groupBy` directly on date parts is not universally supported across all DBs.
    // The most robust way is to select the date, then group/map in JavaScript,
    // OR use Prisma's `_count` on all records and then filter/group by date parts in JS,
    // OR use a raw SQL query if exact year grouping is critical directly in the DB.

    // Let's go with a more Prisma-idiomatic way by fetching relevant data
    // and then processing it in JavaScript for broader database compatibility.
    // If you're using PostgreSQL, you can use `EXTRACT(YEAR FROM "created_at")`.

    const visitorSchedules = await prisma.visitors_schedule.findMany({
      where: whereClause,
      select: {
        created_at: true, // Or visitor_entry_date, depending on which date you want to count by
      },
      // You can limit the results if there are too many and you only need recent years
      // take: 10000, // Example: Limit to 10,000 records to avoid fetching too much data
    });

    // Process the results to get counts by year
    const yearlyCounts: { [year: number]: number } = {};
    visitorSchedules.forEach((schedule) => {
      if (schedule.created_at) {
        const year = new Date(schedule.created_at).getFullYear();
        yearlyCounts[year] = (yearlyCounts[year] || 0) + 1;
      }
    });

    // Convert the aggregated object to an array of objects
    const data: VisitorCountByYear[] = Object.keys(yearlyCounts)
      .map((year) => ({
        year: Number(year),
        count: yearlyCounts[Number(year)],
      }))
      .sort((a, b) => a.year - b.year); // Sort by year for better presentation

    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching visitor count by year:", error);
    return { success: false, message: "Failed to fetch visitor data: " + error.message };
  }
}




