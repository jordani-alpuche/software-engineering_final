"use server";
// import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// const prisma = new PrismaClient({
//   log: ["query", "info", "warn", "error"],
// });

interface GroupVisitorData {
  resident_id: number;
  visitors: {
    visitor_first_name: string;
    visitor_last_name: string;
    visitor_id_type: string;
    visitor_id_number: string;
  }[];
  visitor_phone: string;
  visitor_email: string;
  status: string;
  visitor_type: string;
  visitor_entry_date: string | Date;
  visitor_exit_date: string | Date;
  license_plate: string;
  comments?: string;
  sg_type: number;
}

interface IndividualVisitorData {
  resident_id: number;
  visitor_first_name: string;
  visitor_last_name: string;
  visitor_phone: string;
  visitor_id_type: string;
  visitor_id_number: string;
  visitor_email: string;
  status: string;
  visitor_type: string;
  visitor_entry_date: string | Date;
  visitor_exit_date: string | Date;
  license_plate: string;
  comments?: string;
  sg_type: number;
}

/*
  This function creates a group visitor schedule in the database.
  It first checks if the required fields are present and valid.
  If any member of the group is blacklisted, it returns an error message.
  If all checks pass, it creates the visitor schedule and visitors in a transaction.
*/
export async function createGroupVisitor(data: GroupVisitorData) {
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

    // Check if any member of the group is blacklisted
    for (const member of data.visitors) {
      // console.log("Checking member:", member); // Log the member being checked

      const blacklisted = await prisma.blacklist_visitors.findFirst({
        where: {
          visitiors: {
            visitor_id_type: member.visitor_id_type,
            visitor_id_number: member.visitor_id_number,
          },
        },
      });

      if (blacklisted) {
        return {
          success: false,
          code: 403,
          message: `Visitor ${member.visitor_first_name} ${member.visitor_last_name} is blacklisted`,
        };
      }
    }

    const qr_code = "1233456"; // Generate dynamically in production

    const result = await prisma.$transaction(async (tx) => {
      const blacklist = await tx.blacklist_visitors.findMany({
        include: {
          visitiors: true,
        },
      });
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

      const qr_code_url = `https://gatecommunity.techadmin.me/visitors/viewvisitor/${visitorSchedule.id}`;

      await tx.visitors_schedule.update({
        where: { id: visitorSchedule.id },
        data: {
          visitor_qrcode: qr_code_url,
        },
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

/*
  This function creates an individual visitor schedule in the database.
  It first checks if the required fields are present and valid.
  If the visitor is blacklisted, it returns an error message.
  If all checks pass, it creates the visitor schedule and visitor in a transaction.
*/

export async function createIndividualVisitor(data: IndividualVisitorData) {
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

    // Check if the visitor is blacklisted by visitor_id_type and visitor_id_number
    const blacklistedVisitor = await prisma.blacklist_visitors.findFirst({
      where: {
        visitiors: {
          visitor_id_type: data.visitor_id_type,
          visitor_id_number: data.visitor_id_number,
        },
      },
    });

    if (blacklistedVisitor) {
      return {
        success: false,
        code: 403,
        message: "Visitor is blacklisted",
      };
    }

    const qr_code = "123456789"; // Generate dynamically in production

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

      const qr_code_url = `https://gatecommunity.techadmin.me/visitors/viewvisitor/${visitorSchedule.id}`;

      await tx.visitors_schedule.update({
        where: { id: visitorSchedule.id },
        data: {
          visitor_qrcode: qr_code_url,
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
