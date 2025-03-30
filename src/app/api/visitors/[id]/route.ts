"use server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authentication logic

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Fetch a schedule by ID
export async function getSchedule(id: number) {
  const session = await getServerSession(authOptions);
  const userid = session?.user.id;

  const schedule = await prisma.visitors_schedule.findUnique({
    where: { id: Number(id), resident_id: Number(userid) },
    include: {
      visitiors: true, // Include visitor details
    },
  });

  return schedule || null;
}

// Update a Schedule by ID
export async function updateSchedule(id: number, data: any) {
  try {
    if (
      !data.resident_id ||
      !Array.isArray(data.visitors) ||
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
