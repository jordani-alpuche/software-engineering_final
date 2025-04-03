"use server";
import { PrismaClient, visitors_schedule } from "@prisma/client"; // Import types if needed

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Define the expected payload structure
interface EntryExitPayload {
  visitorId: number | string;
  scheduleId: number | string;
  securityId: number | string;
  action: "logEntry" | "logExit" | "updateOneTime"; // Differentiates the operation
  entryChecked?: boolean; // Only for updateOneTime
  exitChecked?: boolean; // Only for updateOneTime
}

// Define a consistent return type
interface ActionResult {
  success: boolean;
  code: number;
  message: string;
  data?: any; // Optional data field (e.g., the created/updated log)
}

export async function updateEntryExitStatus(
  payload: EntryExitPayload
): Promise<ActionResult> {
  try {
    console.log("Received payload:", payload);

    // --- 1. Validate and Convert IDs ---
    const visitorIdNum = Number(payload.visitorId);
    const scheduleIdNum = Number(payload.scheduleId);
    const securityIdNum = Number(payload.securityId);
    const action = payload.action;

    if (isNaN(visitorIdNum) || isNaN(scheduleIdNum) || isNaN(securityIdNum)) {
      return {
        success: false,
        code: 400,
        message: "Invalid ID format provided.",
      };
    }

    // --- 2. Fetch the Schedule to determine visitor type ---
    const schedule = await prisma.visitors_schedule.findUnique({
      where: { id: scheduleIdNum },
    });

    if (!schedule) {
      return {
        success: false,
        code: 404,
        message: `Schedule with ID ${scheduleIdNum} not found.`,
      };
    }

    const visitorType = schedule.visitor_type; // "one-time" or "recurring"

    // --- 3. Process based on Visitor Type and Action ---

    // =============================
    // === RECURRING VISITOR LOGIC ===
    // =============================
    if (visitorType === "recurring") {
      if (action === "logEntry") {
        // Find the latest log entry for this visitor/schedule to check if already inside
        const lastLog = await prisma.visitor_entry_logs.findFirst({
          where: {
            visitor_id: visitorIdNum,
            visitor_schedule_id: scheduleIdNum,
          },
          orderBy: { entry_time: "desc" }, // Get the most recent one
        });

        // Check if already inside
        if (lastLog && !lastLog.exit_time) {
          return {
            success: false,
            code: 400,
            message: "Visitor is already logged in for this schedule.",
          };
        }

        // Create a new entry log
        const newLog = await prisma.visitor_entry_logs.create({
          data: {
            visitor_id: visitorIdNum,
            visitor_schedule_id: scheduleIdNum,
            security_id: securityIdNum,
            entry_time: new Date(),
            exit_time: null, // Explicitly null
            entry_type: "recurring_entry", // Indicate type
          },
        });
        console.log("Created recurring entry log:", newLog);
        return {
          success: true,
          code: 200,
          message: "Visitor logged in successfully.",
          data: newLog,
        };
      } else if (action === "logExit") {
        // Find the latest log entry that is still open (no exit time)
        const logToUpdate = await prisma.visitor_entry_logs.findFirst({
          where: {
            visitor_id: visitorIdNum,
            visitor_schedule_id: scheduleIdNum,
            exit_time: null, // Must be an open entry
          },
          orderBy: { entry_time: "desc" }, // Get the most recent open entry
        });

        if (!logToUpdate) {
          return {
            success: false,
            code: 400,
            message: "No active entry log found for this visitor to log out.",
          };
        }

        // Update the found log with exit time
        const updatedLog = await prisma.visitor_entry_logs.update({
          where: { id: logToUpdate.id },
          data: {
            exit_time: new Date(),
            entry_type: "recurring_exit", // Indicate type
          },
        });
        console.log("Updated recurring exit log:", updatedLog);
        return {
          success: true,
          code: 200,
          message: "Visitor logged out successfully.",
          data: updatedLog,
        };
      } else {
        // Invalid action for recurring type
        return {
          success: false,
          code: 400,
          message: `Invalid action '${action}' for recurring visitor type.`,
        };
      }
    }

    // ===========================
    // === ONE-TIME VISITOR LOGIC ===
    // ===========================
    else if (visitorType === "one-time") {
      if (action === "updateOneTime") {
        const { entryChecked, exitChecked } = payload;

        // Find the single expected log entry for this visitor/schedule
        // Note: Searching without securityId here, assuming one log per visitor/schedule for one-time
        const existingLog = await prisma.visitor_entry_logs.findFirst({
          where: {
            visitor_id: visitorIdNum,
            visitor_schedule_id: scheduleIdNum,
          },
          // Add orderBy if there's a chance of multiple logs even for one-time by error
          // orderBy: { created_at: 'desc'}
        });

        console.log("One-Time - Existing Log:", existingLog);
        console.log("One-Time - Checkbox States:", {
          entryChecked,
          exitChecked,
        });

        if (entryChecked) {
          // --- Entry is checked ---
          const entryTime = existingLog?.entry_time ?? new Date(); // Use existing or set new
          const exitTime = exitChecked
            ? existingLog?.exit_time ?? new Date()
            : null; // Set exit if checked, otherwise null

          if (existingLog) {
            // Update existing log
            const updatedLog = await prisma.visitor_entry_logs.update({
              where: { id: existingLog.id },
              data: {
                entry_time: entryTime, // Should already exist, but safe to set
                exit_time: exitTime,
                security_id: securityIdNum, // Update security ID if it changed
                entry_type: "one_time_update",
              },
            });
            console.log("Updated one-time log:", updatedLog);
            return {
              success: true,
              code: 200,
              message: "One-time status updated.",
              data: updatedLog,
            };
          } else {
            // Create new log
            const newLog = await prisma.visitor_entry_logs.create({
              data: {
                visitor_id: visitorIdNum,
                visitor_schedule_id: scheduleIdNum,
                security_id: securityIdNum,
                entry_time: entryTime, // Always set entry time if creating
                exit_time: exitTime, // Set exit time based on checkbox
                entry_type: "one_time_initial",
              },
            });
            console.log("Created one-time log:", newLog);
            return {
              success: true,
              code: 200,
              message: "One-time status created.",
              data: newLog,
            };
          }
        } else {
          // --- Entry is unchecked ---
          // Following the original logic's apparent intent: delete the log if entry is unchecked
          if (existingLog) {
            await prisma.visitor_entry_logs.delete({
              where: { id: existingLog.id },
            });
            console.log(
              "Deleted one-time log due to unchecked entry:",
              existingLog.id
            );
            return {
              success: true,
              code: 200,
              message: "One-time entry log removed.",
            };
          } else {
            // No log exists, and entry is unchecked - do nothing
            console.log(
              "No one-time log found, entry unchecked - no action taken."
            );
            return {
              success: true,
              code: 200,
              message: "No action needed (no log, entry unchecked).",
            };
          }
        }
      } else {
        // Invalid action for one-time type
        return {
          success: false,
          code: 400,
          message: `Invalid action '${action}' for one-time visitor type.`,
        };
      }
    }

    // ===========================
    // === UNKNOWN VISITOR TYPE ===
    // ===========================
    else {
      return {
        success: false,
        code: 400,
        message: `Unknown visitor type '${visitorType}' encountered.`,
      };
    }
  } catch (error: any) {
    console.error("Error in updateEntryExitStatus:", error);
    return {
      success: false,
      code: 500,
      message: "Server error: " + error.message,
    };
  }
}
