// __tests__/actions/visitorFlowActions.test.ts

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { updateEntryExitStatus } from "@/lib/serverActions/visitors/entry-exit/ExitLogActions"; // Adjust path
import { visitorsLog } from "@/lib/serverActions/visitors/entrylog/EntryLogActions"; // Adjust path
import { visitorsInfo } from "@/lib/serverActions/visitors/list/ListVisitorActions"; // Adjust path
import { authOptions } from "@/lib/auth"; // Assuming this is the correct path

// --- Mock Prisma Client ---
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    visitors_schedule: {
      // Added mocks
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    visitor_entry_logs: {
      // Added mocks
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    // Include other models if needed
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    blacklist_visitors: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    visitiors: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
    },
    // Mock disconnect
    $disconnect: jest.fn(),
    // Mock transaction (though not used directly in these specific functions, keep for consistency if needed elsewhere)
    $transaction: jest.fn().mockImplementation(async (callback) => {
      const mockTx = {
        /* ... transaction mocks if needed ... */
      };
      return await callback(mockTx);
    }),
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

// --- Mock NextAuth ---
jest.mock("next-auth/next");
const mockGetServerSession = getServerSession as jest.Mock;

// --- Mock next/cache ---
jest.mock("next/cache");
const mockRevalidatePath = revalidatePath as jest.Mock;

// --- Prisma Instance (using the mock) ---
const prisma = new PrismaClient();

// --- Console Silencing ---
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers(); // Use real timers by default

  // Default mock for getServerSession
  mockGetServerSession.mockResolvedValue({
    user: { id: "mock-user-id-visitor" },
  });
  // Default mock for revalidatePath
  mockRevalidatePath.mockImplementation(() => {});

  // Suppress console output
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  // Restore console output
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  // Ensure fake timers are cleared
  jest.useRealTimers();
});
// --- End Console Silencing ---

// --- Test Suite for updateEntryExitStatus ---
describe("updateEntryExitStatus Action", () => {
  const scheduleId = 1;
  const visitorId = 10;
  const securityId = 5;
  const futureDate = new Date(Date.now() + 86400000); // +1 day
  const pastDate = new Date(Date.now() - 86400000); // -1 day

  const mockScheduleBase = {
    id: scheduleId,
    status: "active", // Default active
    visitor_exit_date: futureDate, // Default future date
  };

  const mockLogBase = {
    id: 100,
    visitor_id: visitorId,
    visitor_schedule_id: scheduleId,
    security_id: securityId,
    entry_time: null,
    exit_time: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  it("should return 404 if schedule is not found", async () => {
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(null);
    const payload = {
      scheduleId,
      visitorId,
      securityId,
      action: "logEntry",
    } as any;

    const result = await updateEntryExitStatus(payload);

    expect(result).toEqual({
      success: false,
      code: 404,
      message: "Schedule not found.",
    });
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalledWith({
      where: { id: scheduleId },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/visitors/view/${scheduleId}`
    ); // Finally block
  });

  it("should return 400 if visitor type is unknown", async () => {
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue({
      ...mockScheduleBase,
      visitor_type: "unknown",
    });
    const payload = {
      scheduleId,
      visitorId,
      securityId,
      action: "logEntry",
    } as any;

    const result = await updateEntryExitStatus(payload);

    expect(result).toEqual({
      success: false,
      code: 400,
      message: "Unknown visitor type.",
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/visitors/view/${scheduleId}`
    );
  });

  it("should return 500 if initial schedule lookup fails", async () => {
    const dbError = new Error("DB lookup failed");
    (prisma.visitors_schedule.findUnique as jest.Mock).mockRejectedValue(
      dbError
    );
    const payload = {
      scheduleId,
      visitorId,
      securityId,
      action: "logEntry",
    } as any;

    const result = await updateEntryExitStatus(payload);

    expect(result.success).toBe(false);
    expect(result.code).toBe(500);
    expect(result.message).toBe("Failed to update entry/exit status.");
    expect(result.data).toBe(dbError.message);
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/visitors/view/${scheduleId}`
    );
  });

  // --- Tests for One-Time Visitor ---
  describe("One-Time Visitor", () => {
    const oneTimeSchedule = { ...mockScheduleBase, visitor_type: "one-time" };

    it("should return 403 if schedule is inactive", async () => {
      (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue({
        ...oneTimeSchedule,
        status: "inactive",
      });
      const payload = {
        scheduleId,
        visitorId,
        securityId,
        action: "updateOneTime",
        entryChecked: true,
        exitChecked: false,
      } as any;

      const result = await updateEntryExitStatus(payload);

      expect(result).toEqual({
        success: false,
        code: 403,
        message: "Schedule is inactive or exit date has been reached.",
      });
      expect(prisma.visitors_schedule.update).toHaveBeenCalledWith({
        where: { id: scheduleId }, // Use the scheduleId defined in the test scope
        data: { status: "inactive" },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        `/visitors/view/${scheduleId}`
      );
    });

    it("should return 403 and update status to inactive if exit date passed", async () => {
      jest.useFakeTimers().setSystemTime(new Date()); // Use fake timers
      const now = new Date();
      const exitDatePast = new Date(now.getTime() - 1000); // 1 second in the past
      (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue({
        ...oneTimeSchedule,
        visitor_exit_date: exitDatePast,
      });
      (prisma.visitors_schedule.update as jest.Mock).mockResolvedValue({});
      const payload = {
        scheduleId,
        visitorId,
        securityId,
        action: "updateOneTime",
        entryChecked: true,
        exitChecked: false,
      } as any;

      const result = await updateEntryExitStatus(payload);

      expect(result).toEqual({
        success: false,
        code: 403,
        message: "Schedule is inactive or exit date has been reached.",
      });
      expect(prisma.visitors_schedule.update).toHaveBeenCalledWith({
        where: { id: scheduleId },
        data: { status: "inactive" },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        `/visitors/view/${scheduleId}`
      );
    });

    it("should return 400 if action is invalid for one-time", async () => {
      (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
        oneTimeSchedule
      );
      const payload = {
        scheduleId,
        visitorId,
        securityId,
        action: "logEntry",
      } as any; // Invalid action
      const result = await updateEntryExitStatus(payload);
      expect(result).toEqual({
        success: false,
        code: 400,
        message: "Invalid action for one-time visitor.",
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        `/visitors/view/${scheduleId}`
      );
    });

    describe("Action: updateOneTime", () => {
      const actionPayloadBase = {
        scheduleId,
        visitorId,
        securityId,
        action: "updateOneTime",
        visitorExit: new Date(),
      } as any;

      // Entry Only
      it("[Entry Only] should create log if none exists", async () => {
        (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
          oneTimeSchedule
        );
        (prisma.visitor_entry_logs.findFirst as jest.Mock).mockResolvedValue(
          null
        );
        (prisma.visitor_entry_logs.create as jest.Mock).mockResolvedValue({});
        const payload = {
          ...actionPayloadBase,
          entryChecked: true,
          exitChecked: false,
        };

        const result = await updateEntryExitStatus(payload);

        expect(result.code).toBe(200);
        expect(result.message).toContain("updated successfully");
        expect(prisma.visitor_entry_logs.create).toHaveBeenCalledWith({
          data: {
            security_id: securityId, // Use variable from test setup
            visitor_schedule_id: scheduleId, // Use variable
            visitor_id: visitorId, // Use variable
            entry_time: expect.any(Date), // Check entry time is set
            // exit_time is implicitly undefined/omitted, which is correct
          },
        });
        expect(prisma.visitor_entry_logs.update).not.toHaveBeenCalled();
      });
      it("[Entry Only] should update log if exists without entry time", async () => {
        (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
          oneTimeSchedule
        );
        (prisma.visitor_entry_logs.findFirst as jest.Mock).mockResolvedValue({
          ...mockLogBase,
          entry_time: null,
        });
        (prisma.visitor_entry_logs.update as jest.Mock).mockResolvedValue({});
        const payload = {
          ...actionPayloadBase,
          entryChecked: true,
          exitChecked: false,
        };

        const result = await updateEntryExitStatus(payload);

        expect(result.code).toBe(200);
        expect(prisma.visitor_entry_logs.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: mockLogBase.id },
            data: { entry_time: expect.any(Date) },
          })
        );
        expect(prisma.visitor_entry_logs.create).not.toHaveBeenCalled();
      });

      // Exit Only
      it("[Exit Only] should update log if entry exists without exit", async () => {
        (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
          oneTimeSchedule
        );
        (prisma.visitor_entry_logs.findFirst as jest.Mock).mockResolvedValue({
          ...mockLogBase,
          entry_time: new Date(),
          exit_time: null,
        });
        (prisma.visitor_entry_logs.update as jest.Mock).mockResolvedValue({});
        const payload = {
          ...actionPayloadBase,
          entryChecked: false,
          exitChecked: true,
        };

        const result = await updateEntryExitStatus(payload);

        expect(result.code).toBe(200);
        expect(prisma.visitor_entry_logs.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: mockLogBase.id },
            data: { exit_time: expect.any(Date) },
          })
        );
        expect(prisma.visitor_entry_logs.create).not.toHaveBeenCalled();
      });

      // Entry and Exit
      it("[Entry & Exit] should create log if none exists", async () => {
        (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
          oneTimeSchedule
        );
        (prisma.visitor_entry_logs.findFirst as jest.Mock).mockResolvedValue(
          null
        );
        (prisma.visitor_entry_logs.create as jest.Mock).mockResolvedValue({});
        const payload = {
          ...actionPayloadBase,
          entryChecked: true,
          exitChecked: true,
        };

        const result = await updateEntryExitStatus(payload);

        expect(result.code).toBe(200);
        expect(prisma.visitor_entry_logs.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              entry_time: expect.any(Date),
              exit_time: expect.any(Date),
            }),
          })
        );
        expect(prisma.visitor_entry_logs.update).not.toHaveBeenCalled();
      });
      it("[Entry & Exit] should update log if exists without entry time", async () => {
        (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
          oneTimeSchedule
        );
        (prisma.visitor_entry_logs.findFirst as jest.Mock).mockResolvedValue({
          ...mockLogBase,
          entry_time: null,
        });
        (prisma.visitor_entry_logs.update as jest.Mock).mockResolvedValue({});
        const payload = {
          ...actionPayloadBase,
          entryChecked: true,
          exitChecked: true,
        };

        const result = await updateEntryExitStatus(payload);

        expect(result.code).toBe(200);
        expect(prisma.visitor_entry_logs.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: mockLogBase.id },
            data: { entry_time: expect.any(Date), exit_time: expect.any(Date) },
          })
        );
        expect(prisma.visitor_entry_logs.create).not.toHaveBeenCalled();
      });
      it("[Entry & Exit] should update exit time if entry exists without exit", async () => {
        (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
          oneTimeSchedule
        );
        (prisma.visitor_entry_logs.findFirst as jest.Mock).mockResolvedValue({
          ...mockLogBase,
          entry_time: new Date(),
          exit_time: null,
        });
        (prisma.visitor_entry_logs.update as jest.Mock).mockResolvedValue({});
        const payload = {
          ...actionPayloadBase,
          entryChecked: true,
          exitChecked: true,
        };

        const result = await updateEntryExitStatus(payload);

        expect(result.code).toBe(200);
        expect(prisma.visitor_entry_logs.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: mockLogBase.id },
            data: { exit_time: expect.any(Date) },
          })
        );
        expect(prisma.visitor_entry_logs.create).not.toHaveBeenCalled();
      });

      // Neither Checked
      it("[Neither] should set exit_time to null if log exists with exit_time", async () => {
        (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
          oneTimeSchedule
        );
        (prisma.visitor_entry_logs.findFirst as jest.Mock).mockResolvedValue({
          ...mockLogBase,
          entry_time: new Date(),
          exit_time: new Date(),
        });
        (prisma.visitor_entry_logs.update as jest.Mock).mockResolvedValue({});
        const payload = {
          ...actionPayloadBase,
          entryChecked: false,
          exitChecked: false,
        };

        const result = await updateEntryExitStatus(payload);

        expect(result.code).toBe(200);
        expect(prisma.visitor_entry_logs.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: mockLogBase.id },
            data: { exit_time: null },
          })
        );
        expect(prisma.visitor_entry_logs.create).not.toHaveBeenCalled();
      });
      it("[Neither] should set entry_time to null if log exists with entry_time only", async () => {
        (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
          oneTimeSchedule
        );
        (prisma.visitor_entry_logs.findFirst as jest.Mock).mockResolvedValue({
          ...mockLogBase,
          entry_time: new Date(),
          exit_time: null,
        });
        (prisma.visitor_entry_logs.update as jest.Mock).mockResolvedValue({});
        const payload = {
          ...actionPayloadBase,
          entryChecked: false,
          exitChecked: false,
        };

        const result = await updateEntryExitStatus(payload);

        expect(result.code).toBe(200);
        expect(prisma.visitor_entry_logs.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: mockLogBase.id },
            data: { entry_time: null },
          })
        );
        expect(prisma.visitor_entry_logs.create).not.toHaveBeenCalled();
      });
    }); // End describe 'Action: updateOneTime'
  }); // End describe 'One-Time Visitor'

  // --- Tests for Recurring Visitor ---
  describe("Recurring Visitor", () => {
    const recurringSchedule = {
      ...mockScheduleBase,
      visitor_type: "recurring",
    };

    it("should return 403 if schedule is inactive", async () => {
      (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue({
        ...recurringSchedule,
        status: "inactive",
      });
      const payload = {
        scheduleId,
        visitorId,
        securityId,
        action: "logEntry",
      } as any;
      const result = await updateEntryExitStatus(payload);
      expect(result.code).toBe(403);
      // Expect the update call even if status is already inactive, because the code does this
      expect(prisma.visitors_schedule.update).toHaveBeenCalledWith({
        where: { id: scheduleId }, // Use the scheduleId defined in the test scope
        data: { status: "inactive" },
      });
    });

    it("should return 403 and update status if exit date passed", async () => {
      jest.useFakeTimers().setSystemTime(new Date());
      const now = new Date();
      const exitDatePast = new Date(now.getTime() - 1000);
      (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue({
        ...recurringSchedule,
        visitor_exit_date: exitDatePast,
      });
      (prisma.visitors_schedule.update as jest.Mock).mockResolvedValue({});
      const payload = {
        scheduleId,
        visitorId,
        securityId,
        action: "logEntry",
      } as any;
      const result = await updateEntryExitStatus(payload);
      expect(result.code).toBe(403);
      expect(prisma.visitors_schedule.update).toHaveBeenCalledWith({
        where: { id: scheduleId },
        data: { status: "inactive" },
      });
    });

    it("should return 400 if action is invalid for recurring", async () => {
      (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
        recurringSchedule
      );
      const payload = {
        scheduleId,
        visitorId,
        securityId,
        action: "updateOneTime",
      } as any; // Invalid action
      const result = await updateEntryExitStatus(payload);
      expect(result).toEqual({
        success: false,
        code: 400,
        message: "Invalid action for recurring visitor.",
      });
    });

    describe("Action: logEntry", () => {
      const actionPayload = {
        scheduleId,
        visitorId,
        securityId,
        action: "logEntry",
      } as any;

      it("should create log if no open log exists", async () => {
        (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
          recurringSchedule
        );
        (prisma.visitor_entry_logs.findFirst as jest.Mock).mockResolvedValue(
          null
        ); // No open log
        (prisma.visitor_entry_logs.create as jest.Mock).mockResolvedValue({});

        const result = await updateEntryExitStatus(actionPayload);

        expect(result.code).toBe(200);
        expect(result.message).toBe("Recurring visitor entry logged.");
        expect(prisma.visitor_entry_logs.create).toHaveBeenCalledWith({
          data: {
            security_id: securityId, // Use variable from test setup
            visitor_schedule_id: scheduleId, // Use variable
            visitor_id: visitorId, // Use variable
            entry_time: expect.any(Date), // Check entry time is set
            // exit_time is implicitly undefined/omitted, which is correct
          },
        });
      });

      it("should return 400 if an open log already exists", async () => {
        (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
          recurringSchedule
        );
        (prisma.visitor_entry_logs.findFirst as jest.Mock).mockResolvedValue({
          ...mockLogBase,
          entry_time: new Date(),
          exit_time: null,
        }); // Open log

        const result = await updateEntryExitStatus(actionPayload);

        expect(result.code).toBe(400);
        expect(result.message).toBe("Visitor is already logged in.");
        expect(prisma.visitor_entry_logs.create).not.toHaveBeenCalled();
      });
    }); // End describe 'Action: logEntry'

    describe("Action: logExit", () => {
      const actionPayload = {
        scheduleId,
        visitorId,
        securityId,
        action: "logExit",
      } as any;

      it("should update log if an open log exists", async () => {
        (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
          recurringSchedule
        );
        (prisma.visitor_entry_logs.findFirst as jest.Mock).mockResolvedValue({
          ...mockLogBase,
          entry_time: new Date(),
          exit_time: null,
        }); // Open log
        (prisma.visitor_entry_logs.update as jest.Mock).mockResolvedValue({});

        const result = await updateEntryExitStatus(actionPayload);

        expect(result.code).toBe(200);
        expect(result.message).toBe("Recurring visitor exit logged.");
        expect(prisma.visitor_entry_logs.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: mockLogBase.id },
            data: { exit_time: expect.any(Date) },
          })
        );
      });

      it("should return 400 if no open log exists", async () => {
        (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
          recurringSchedule
        );
        (prisma.visitor_entry_logs.findFirst as jest.Mock).mockResolvedValue(
          null
        ); // No open log

        const result = await updateEntryExitStatus(actionPayload);

        expect(result.code).toBe(400);
        expect(result.message).toBe(
          "No active entry log found for this visitor."
        );
        expect(prisma.visitor_entry_logs.update).not.toHaveBeenCalled();
      });
    }); // End describe 'Action: logExit'
  }); // End describe 'Recurring Visitor'
}); // End describe 'updateEntryExitStatus Action'

// --- Test Suite for visitorsLog ---
describe("visitorsLog Action", () => {
  const mockLogs = [
    {
      id: 1,
      visitor_id: 10,
      entry_time: new Date(),
      visitiors: { visitor_first_name: "A" },
    },
    {
      id: 2,
      visitor_id: 11,
      entry_time: new Date(),
      visitiors: { visitor_first_name: "B" },
    },
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "some-user" } });
    console.log = jest.fn();
    console.error = jest.fn();
  });

  it("should return a list of all visitor logs with visitor details", async () => {
    (prisma.visitor_entry_logs.findMany as jest.Mock).mockResolvedValue(
      mockLogs
    );
    const result = await visitorsLog();
    expect(result).toEqual(mockLogs);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitor_entry_logs.findMany).toHaveBeenCalledWith({
      include: { visitiors: true },
    });
  });

  it("should return an empty array if no logs exist", async () => {
    (prisma.visitor_entry_logs.findMany as jest.Mock).mockResolvedValue([]);
    const result = await visitorsLog();
    expect(result).toEqual([]);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitor_entry_logs.findMany).toHaveBeenCalledWith({
      include: { visitiors: true },
    });
  });

  it("should return error object if prisma findMany fails", async () => {
    const dbError = new Error("Failed log fetch");
    (prisma.visitor_entry_logs.findMany as jest.Mock).mockRejectedValue(
      dbError
    );
    const result = await visitorsLog();
    expect(result).toEqual(dbError);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
  });
});

// --- Test Suite for visitorsInfo ---
describe("visitorsInfo Action", () => {
  const userId = 999;
  const mockSchedules = [
    { id: 1, resident_id: userId, visitiors: [{ visitor_first_name: "C" }] },
    { id: 2, resident_id: userId, visitiors: [{ visitor_first_name: "D" }] },
  ];

  beforeEach(() => {
    // Reset mocks and set specific user ID
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: userId.toString() } });
    console.log = jest.fn();
    console.error = jest.fn();
  });

  it("should return schedules for the logged-in resident", async () => {
    (prisma.visitors_schedule.findMany as jest.Mock).mockResolvedValue(
      mockSchedules
    );
    const result = await visitorsInfo();
    expect(result).toEqual(mockSchedules);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitors_schedule.findMany).toHaveBeenCalledWith({
      where: { resident_id: userId },
      include: { visitiors: true },
      orderBy: { visitor_entry_date: "desc" },
    });
  });

  it("should return an empty array if no schedules exist for the resident", async () => {
    (prisma.visitors_schedule.findMany as jest.Mock).mockResolvedValue([]);
    const result = await visitorsInfo();
    expect(result).toEqual([]);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitors_schedule.findMany).toHaveBeenCalledWith({
      where: { resident_id: userId },
      include: { visitiors: true },
      orderBy: { visitor_entry_date: "desc" },
    });
  });

  it("should return error object if prisma findMany fails", async () => {
    const dbError = new Error("Failed schedule fetch");
    (prisma.visitors_schedule.findMany as jest.Mock).mockRejectedValue(dbError);
    const result = await visitorsInfo();
    expect(result).toEqual(dbError);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
  });

  it("should return empty array if session is null (where clause uses NaN)", async () => {
    mockGetServerSession.mockResolvedValue(null);
    // Prisma typically returns [] when querying with NaN in a where clause
    (prisma.visitors_schedule.findMany as jest.Mock).mockResolvedValue([]);
    const result = await visitorsInfo();
    expect(result).toEqual([]);
    expect(prisma.visitors_schedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { resident_id: NaN }, // Result of Number(undefined)
      })
    );
  });
});
