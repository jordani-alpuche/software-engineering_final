"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export async function updateEntryExitStatus(data: any) {
  try {
    const results = [];

    for (const entryData of data) {
      const { visitorId, entryChecked, exitChecked, scheduleId, securityId } =
        entryData;

      const visitorIdNum = Number(visitorId);
      const securityIdNum = Number(securityId);
      const scheduleIdNum = Number(scheduleId);

      // Check if the visitor already has an entry log
      let existingLog = await prisma.visitor_entry_logs.findFirst({
        where: {
          visitor_schedule_id: scheduleIdNum,
          security_id: securityIdNum,
          visitor_id: visitorIdNum,
        },
      });

      console.log("Data received:", entryData);
      console.log("Existing Log:", existingLog);

      // If entry is unchecked and log exists, delete the entry log
      if (!entryChecked && existingLog) {
        await prisma.visitor_entry_logs.delete({
          where: { id: existingLog.id },
        });
        results.push({
          visitorIdNum,
          success: true,
          code: 200,
          message: "Entry log deleted successfully",
        });
        continue; // Skip further processing for this visitor
      }

      // If entry is checked but log does not exist, create a new entry log
      if (entryChecked && !existingLog) {
        existingLog = await prisma.visitor_entry_logs.create({
          data: {
            visitor_schedule_id: scheduleIdNum,
            security_id: securityIdNum,
            visitor_id: visitorIdNum,
            entry_time: new Date(),
            entry_type: "manual",
          },
        });
        results.push({
          visitorIdNum,
          success: true,
          code: 200,
          message: "Entry log created successfully",
        });
      }

      // If exit is checked, update the exit_time (ensure log exists)
      if (exitChecked) {
        if (!existingLog) {
          results.push({
            visitorIdNum,
            success: false,
            code: 400,
            message: "Cannot mark exit without an entry log",
          });
          continue;
        }

        await prisma.visitor_entry_logs.update({
          where: { id: existingLog.id },
          data: { exit_time: new Date() },
        });
        results.push({
          visitorIdNum,
          success: true,
          code: 200,
          message: "Exit time updated successfully",
        });
      }

      // If exit is unchecked and there is an existing log, remove the exit_time
      if (!exitChecked && existingLog?.exit_time) {
        await prisma.visitor_entry_logs.update({
          where: { id: existingLog.id },
          data: { exit_time: null },
        });
        results.push({
          visitorIdNum,
          success: true,
          code: 200,
          message: "Exit time removed successfully",
        });
      }
    }

    return { success: true, code: 200, results };
  } catch (error: any) {
    console.error("Error updating entry/exit:", error);
    return {
      success: false,
      code: 500,
      message: "Server error: " + error.message,
    };
  }
}
