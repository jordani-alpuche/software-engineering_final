"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export async function createGroupVisitor(data: any) {
  try {
    if (
      !data.resident_id ||
      !data.visitors ||
      !Array.isArray(data.visitors) ||
      data.visitors.length === 0 ||
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
        message: "Missing required fields or invalid visitors list",
      };
    }

    // Validate visitor fields
    const invalidVisitors = data.visitors.some(
      (visitor) =>
        !visitor.visitor_first_name ||
        !visitor.visitor_last_name ||
        !visitor.visitor_id_type ||
        !visitor.visitor_id_number
    );
    if (invalidVisitors) {
      return {
        success: false,
        code: 400,
        message:
          "Each visitor must have first name, last name, ID type, and ID number",
      };
    }

    const qr_code = "12356"; // Generate unique QR code

    const result = await prisma.$transaction(async (tx) => {
      // Create visitor schedule
      const visitorSchedule = await tx.visitors_schedule.create({
        data: {
          resident_id: data.resident_id,
          visitor_phone: data.visitor_phone,
          visitor_email: data.visitor_email,
          status: data.status,
          visitor_type: data.visitor_type,
          license_plate: data.license_plate,
          visitor_entry_date: new Date(data.visitor_entry_date),
          visitor_exit_date: new Date(data.visitor_exit_date),
          visitor_qrcode: qr_code,
          comments: data.comments,
          sg_type: data.sg_type,
        },
      });

      // Create multiple visitors and link them to the schedule
      await tx.visitiors.createMany({
        data: data.visitors.map((visitor: any) => ({
          visitor_first_name: visitor.visitor_first_name,
          visitor_last_name: visitor.visitor_last_name,
          visitor_id_type: visitor.visitor_id_type,
          visitor_id_number: visitor.visitor_id_number,
          visitor_schedule_id: visitorSchedule.id,
        })),
      });

      return visitorSchedule;
    });

    return {
      success: true,
      code: 200,
      message: "Group visitors scheduled successfully",
      visitorScheduleId: result.id,
    };
  } catch (error: any) {
    console.error("Error in createGroupVisitor:", error);
    return {
      success: false,
      code: 500,
      message: "Server error: " + error.message,
    };
  }
}

export async function createIndividualVisitor(data: any) {
  try {
    // Validate required fields
    if (
      !data.resident_id ||
      !data.visitor_first_name ||
      !data.visitor_last_name ||
      !data.visitor_phone ||
      !data.visitor_id_type ||
      !data.visitor_id_number ||
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

    const qr_code = "1234567890"; // Generate dynamically in production

    // Start a transaction to create both visitor and schedule
    const result = await prisma.$transaction(async (tx) => {
      // Create visitor schedule first
      const visitorSchedule = await tx.visitors_schedule.create({
        data: {
          resident_id: data.resident_id,
          visitor_phone: data.visitor_phone,
          visitor_email: data.visitor_email,
          status: data.status,
          visitor_type: data.visitor_type,
          license_plate: data.license_plate,
          visitor_entry_date: new Date(data.visitor_entry_date),
          visitor_exit_date: new Date(data.visitor_exit_date),
          visitor_qrcode: qr_code,
          comments: data.comments,
          sg_type: data.sg_type,
        },
      });

      // Create visitor and link to schedule
      await tx.visitiors.create({
        data: {
          visitor_first_name: data.visitor_first_name,
          visitor_last_name: data.visitor_last_name,
          visitor_id_type: data.visitor_id_type,
          visitor_id_number: data.visitor_id_number,
          visitor_schedule_id: visitorSchedule.id,
        },
      });

      return visitorSchedule;
    });

    return {
      success: true,
      code: 200,
      message: "Visitor created successfully",
      visitorScheduleId: result.id,
    };
  } catch (error: any) {
    return {
      success: false,
      code: 500,
      message: "Server error: " + error.message,
    };
  }
}
