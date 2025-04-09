// api/visitors/entry-exit/route.ts
"use server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

interface EntryExitPayload {
  visitorId: number | string;
  scheduleId: number | string;
  securityId: number | string;
  action: "logEntry" | "logExit" | "updateOneTime";
  entryChecked?: boolean;
  exitChecked?: boolean;
  visitorExit: string | Date;
  status: string;
}

interface ActionResult {
  success: boolean;
  code: number;
  message: string;
  data?: any;
}

export async function updateEntryExitStatus(
  payload: EntryExitPayload
): Promise<ActionResult> {
  try {
    const {
      visitorId,
      scheduleId,
      securityId,
      action,
      entryChecked,
      exitChecked,
      // visitorEntry,
      visitorExit,
      status,
    } = payload;

    const schedule = await prisma.visitors_schedule.findUnique({
      where: { id: Number(scheduleId) },
    });

    if (!schedule) {
      return { success: false, code: 404, message: "Schedule not found." };
    }

    if (schedule.visitor_type === "one-time") {
      const exitDate = new Date(schedule.visitor_exit_date); // convert to Date object
      const now = new Date(); // current date and time

      if (schedule.status === "inactive" || exitDate < now) {
        await prisma.visitors_schedule.update({
          where: { id: Number(scheduleId) },
          data: { status: "inactive" },
        });

        return {
          success: false,
          code: 403,
          message: "Schedule is inactive or exit date has been reached.",
        };
      }

      if (action === "updateOneTime") {
        let operationPerformed = false;

        // Check if there is an existing log for this visitor/schedule
        let existingLog = await prisma.visitor_entry_logs.findFirst({
          where: {
            visitor_id: Number(visitorId),
            visitor_schedule_id: Number(scheduleId),
          },
          orderBy: {
            updated_at: "desc", // Get the most recent log
          },
        });

        if (entryChecked && !exitChecked) {
          // Entry only
          if (!existingLog || !existingLog.entry_time) {
            if (existingLog) {
              await prisma.visitor_entry_logs.update({
                where: { id: existingLog.id },
                data: { entry_time: new Date() },
              });
            } else {
              await prisma.visitor_entry_logs.create({
                data: {
                  security_id: Number(securityId),
                  visitor_schedule_id: Number(scheduleId),
                  visitor_id: Number(visitorId),
                  entry_time: new Date(),
                },
              });
            }
            operationPerformed = true;
          }
        } else if (!entryChecked && exitChecked) {
          // Exit only
          if (existingLog && existingLog.entry_time && !existingLog.exit_time) {
            await prisma.visitor_entry_logs.update({
              where: { id: existingLog.id },
              data: { exit_time: new Date() },
            });
            operationPerformed = true;
          }
        } else if (entryChecked && exitChecked) {
          // Entry and exit
          if (!existingLog || !existingLog.entry_time) {
            if (existingLog) {
              await prisma.visitor_entry_logs.update({
                where: { id: existingLog.id },
                data: { entry_time: new Date(), exit_time: new Date() },
              });
            } else {
              await prisma.visitor_entry_logs.create({
                data: {
                  security_id: Number(securityId),
                  visitor_schedule_id: Number(scheduleId),
                  visitor_id: Number(visitorId),
                  entry_time: new Date(),
                  exit_time: new Date(),
                },
              });
            }
            operationPerformed = true;
          } else if (
            existingLog &&
            existingLog.entry_time &&
            !existingLog.exit_time
          ) {
            await prisma.visitor_entry_logs.update({
              where: { id: existingLog.id },
              data: { exit_time: new Date() },
            });
            operationPerformed = true;
          }
        } else if (!entryChecked && !exitChecked) {
          // Neither checked, cancel the log
          if (existingLog) {
            if (existingLog.exit_time) {
              await prisma.visitor_entry_logs.update({
                where: { id: existingLog.id },
                data: { exit_time: null },
              });
            } else if (existingLog.entry_time) {
              await prisma.visitor_entry_logs.update({
                where: { id: existingLog.id },
                data: { entry_time: null },
              });
            }
            operationPerformed = true;
          }
        }

        if (operationPerformed) {
          return {
            success: true,
            code: 200,
            message: "One-time visitor status updated successfully.",
          };
        }

        // if (entryChecked || exitChecked) {
        //   return {
        //     success: false,
        //     code: 400,
        //     message: "No changes made.",
        //   };
        // }

        return {
          success: true,
          code: 200,
          message: "No changes requested.",
        };
      } else {
        return {
          success: false,
          code: 400,
          message: "Invalid action for one-time visitor.",
        };
      }
    } else if (schedule.visitor_type === "recurring") {
      const exitDate = new Date(schedule.visitor_exit_date); // convert to Date object
      const now = new Date(); // current date and time

      if (schedule.status === "inactive" || exitDate < now) {
        await prisma.visitors_schedule.update({
          where: { id: Number(scheduleId) },
          data: { status: "inactive" },
        });

        return {
          success: false,
          code: 403,
          message: "Schedule is inactive or exit date has been reached.",
        };
      }

      if (action === "logEntry") {
        const openLog = await prisma.visitor_entry_logs.findFirst({
          where: {
            visitor_id: Number(visitorId),
            visitor_schedule_id: Number(scheduleId),
            exit_time: null,
          },
        });

        if (!openLog) {
          await prisma.visitor_entry_logs.create({
            data: {
              security_id: Number(securityId),
              visitor_schedule_id: Number(scheduleId),
              visitor_id: Number(visitorId),
              entry_time: new Date(),
            },
          });
          return {
            success: true,
            code: 200,
            message: "Recurring visitor entry logged.",
          };
        } else {
          return {
            success: false,
            code: 400,
            message: "Visitor is already logged in.",
          };
        }
      } else if (action === "logExit") {
        const openLog = await prisma.visitor_entry_logs.findFirst({
          where: {
            visitor_id: Number(visitorId),
            visitor_schedule_id: Number(scheduleId),
            exit_time: null,
          },
        });

        if (openLog) {
          await prisma.visitor_entry_logs.update({
            where: { id: openLog.id },
            data: { exit_time: new Date() },
          });
          return {
            success: true,
            code: 200,
            message: "Recurring visitor exit logged.",
          };
        } else {
          return {
            success: false,
            code: 400,
            message: "No active entry log found for this visitor.",
          };
        }
      } else {
        return {
          success: false,
          code: 400,
          message: "Invalid action for recurring visitor.",
        };
      }
    } else {
      return {
        success: false,
        code: 400,
        message: "Unknown visitor type.",
      };
    }
  } catch (error: any) {
    console.error("Error updating entry/exit status:", error);
    return {
      success: false,
      code: 500,
      message: "Failed to update entry/exit status.",
      data: error.message,
    };
  } finally {
    await prisma.$disconnect();
    revalidatePath(`/visitors/view/${payload.scheduleId}`);
  }
}
