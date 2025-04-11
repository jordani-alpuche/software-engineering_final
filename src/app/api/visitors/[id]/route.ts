"use server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authentication logic

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Validate schedule ID existence1
export async function isValidSchedule(id: number) {
  if (isNaN(id)) {
    return { valid: false, error: "Invalid ID format", code: 400 };
  }

  const schedule = await prisma.visitors_schedule.findUnique({
    where: { id },
  });

  if (schedule) {
    return { valid: true, code: 200 };
  } else {
    return { valid: false, error: "Schedule not found", code: 404 };
  }
}

// Fetch a schedule by ID
export async function getSchedule(id: number) {
  const session = await getServerSession(authOptions);
  const userid = session?.user.id;

  const schedule = await prisma.visitors_schedule.findUnique({
    where: { id: Number(id), resident_id: Number(userid) },
    include: {
      visitiors: true, // Include visitor details
      visitor_entry_logs: true, // Include entry logs
    },
  });

  return schedule || null;
}

export async function getVisitors(vid: number) {
  const visitorId = Number(vid);

  // Check if visitor is already blacklisted
  const isBlacklisted = await prisma.blacklist_visitors.findUnique({
    where: { visitor_id: visitorId },
  });

  // If blacklisted, return null early
  if (isBlacklisted) return "exists";

  // Otherwise, get the visitor data
  const visitor = await prisma.visitiors.findUnique({
    where: { id: visitorId },
    include: {
      visitor_entry_logs: true,
      visitors_schedule: true,
    },
  });

  return visitor || null; // Still return null if visitor doesn't exist
}

export async function getAllVisitors() {
  const session = await getServerSession(authOptions);

  // 1. Get distinct blacklist entries
  const blacklist = await prisma.blacklist_visitors.findMany({
    include: {
      visitiors: true,
    },
  });

  // 2. Get distinct visitors
  const visitors = await prisma.visitiors.findMany({
    distinct: [
      "visitor_first_name",
      "visitor_last_name",
      "visitor_id_type",
      "visitor_id_number",
    ],
  });

  // 3. Filter out blacklisted visitors
  const filteredVisitors = visitors.filter((visitor: any) => {
    return !blacklist.some(
      (blacklisted) =>
        visitor.visitor_first_name ===
          blacklisted.visitiors.visitor_first_name &&
        visitor.visitor_last_name === blacklisted.visitiors.visitor_last_name &&
        visitor.visitor_id_type === blacklisted.visitiors.visitor_id_type &&
        visitor.visitor_id_number === blacklisted.visitiors.visitor_id_number
    );
  });

  return filteredVisitors || null;
}

// Update a Schedule by ID
export async function updateIndividualSchedule(id: number, data: any) {
  try {
    // console.log("Data received for update:", data);
    if (
      !data.resident_id ||
      // !Array.isArray(data.visitiors) ||
      !data.visitor_phone ||
      !data.visitor_email ||
      !data.status ||
      !data.visitor_type ||
      !data.visitor_entry_date ||
      !data.visitor_exit_date ||
      !data.license_plate
    ) {
      return {
        success: false,
        code: 400,
        message: "Missing required fields",
      };
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update visitor schedule
      const updatedSchedule = await tx.visitors_schedule.update({
        where: { id: Number(id), resident_id: Number(data.resident_id) },
        data: {
          resident_id: data.resident_id,
          visitor_phone: data.visitor_phone,
          visitor_email: data.visitor_email,
          status: data.status,
          visitor_type: data.visitor_type,
          license_plate: data.license_plate,
          visitor_entry_date: new Date(data.visitor_entry_date),
          visitor_exit_date: new Date(data.visitor_exit_date),
          comments: data.comments,
        },
      });

      // Update visitor details linked to the schedule
      await tx.visitiors.updateMany({
        where: { visitor_schedule_id: updatedSchedule.id },
        data: {
          visitor_first_name: data.visitor_first_name,
          visitor_last_name: data.visitor_last_name,
          visitor_id_type: data.visitor_id_type,
          visitor_id_number: data.visitor_id_number,
        },
      });
    });

    return {
      success: true,
      code: 200,
      message: "Schedule updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      code: 500,
      message: "Server error: " + error.message,
    };
  }
}

export async function updateGroupSchedule(id: number, data: any) {
  try {
    // console.log("Data received for update:", data);

    // Validate required fields
    if (
      !data.resident_id ||
      !data.visitor_phone ||
      !data.visitor_email ||
      !data.status ||
      !data.visitor_type ||
      !data.visitor_entry_date ||
      !data.visitor_exit_date ||
      !data.license_plate
    ) {
      return {
        success: false,
        code: 400,
        message: "Missing required fields",
      };
    }

    // Start transaction
    const response = await prisma.$transaction(async (tx) => {
      // Update visitor schedule
      const updatedSchedule = await tx.visitors_schedule.update({
        where: { id: Number(id), resident_id: Number(data.resident_id) },
        data: {
          resident_id: data.resident_id,
          visitor_phone: data.visitor_phone,
          visitor_email: data.visitor_email,
          status: data.status,
          visitor_type: data.visitor_type,
          license_plate: data.license_plate,
          visitor_entry_date: new Date(data.visitor_entry_date),
          visitor_exit_date: new Date(data.visitor_exit_date),
          comments: data.comments,
        },
      });

      // Fetch existing visitors linked to this schedule
      const existingVisitors = await tx.visitiors.findMany({
        where: { visitor_schedule_id: updatedSchedule.id },
        select: {
          id: true,
          visitor_first_name: true,
          visitor_last_name: true,
          visitor_id_type: true,
          visitor_id_number: true,
        },
      });

      const existingVisitorIds = existingVisitors.map((v) => v.id);
      const submittedVisitorIds = data.visitors
        .map((v) => v.id)
        .filter(Boolean);

      // Update existing visitors and create new ones if necessary
      for (const visitor of data.visitors) {
        if (visitor.id) {
          // Update existing visitor
          await tx.visitiors.update({
            where: { id: visitor.id },
            data: {
              visitor_first_name: visitor.visitor_first_name,
              visitor_last_name: visitor.visitor_last_name,
              visitor_id_type: visitor.visitor_id_type,
              visitor_id_number: visitor.visitor_id_number,
            },
          });
        } else {
          // Create new visitor
          await tx.visitiors.create({
            data: {
              visitor_schedule_id: updatedSchedule.id,
              visitor_first_name: visitor.visitor_first_name,
              visitor_last_name: visitor.visitor_last_name,
              visitor_id_type: visitor.visitor_id_type,
              visitor_id_number: visitor.visitor_id_number,
            },
          });
        }
      }

      // Remove deleted visitors only if they are not already tied to an entry log
      const visitorsToDelete = existingVisitorIds.filter(
        (id) => !submittedVisitorIds.includes(id)
      );

      for (const visitorId of visitorsToDelete) {
        // Check if the visitor has any entry logs associated
        const entryLogs = await tx.visitor_entry_logs.findMany({
          where: { visitor_id: visitorId },
        });

        if (entryLogs.length > 0) {
          throw new Error(
            `Cannot update visitor because they are already linked to an entry log.`
          );
        } else {
          // If no entry logs, proceed to delete the visitor
          await tx.visitiors.delete({
            where: { id: visitorId },
          });
        }
      }

      // Capture the current schedule and visitors
      const updatedVisitors = await tx.visitiors.findMany({
        where: { visitor_schedule_id: updatedSchedule.id },
        select: { id: true, visitor_first_name: true, visitor_last_name: true },
      });

      return {
        updatedSchedule,
        updatedVisitors,
      };
    });

    // Respond with captured schedule and visitors
    return {
      success: true,
      code: 200,
      message: "Schedule successfully updated.",
      updatedSchedule: response.updatedSchedule,
      updatedVisitors: response.updatedVisitors,
    };
  } catch (error: any) {
    return {
      success: false,
      code: 500,
      message: `Server error: ${
        error.message || "An unexpected error occurred"
      }`,
    };
  }
}

// Delete a schedule by ID
export async function deleteSchedule(id: number) {
  try {
    await prisma.$transaction(async (tx) => {
      // Delete visitor first (to maintain foreign key constraints)
      await tx.visitiors.deleteMany({
        where: { visitor_schedule_id: Number(id) },
      });

      // Delete schedule
      await tx.visitors_schedule.delete({
        where: { id: Number(id) },
      });
    });

    return { message: "Schedule deleted successfully", success: true };
  } catch (error) {
    throw new Error("Error deleting schedule");
  }
}
