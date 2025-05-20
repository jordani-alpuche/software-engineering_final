import { updateEntryExitStatus } from "@/lib/serverActions/visitors/entry-exit/ExitLogActions";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { sendEmail } from "@/app/utils/sendEmail";

// Mock revalidatePath to avoid static generation errors in tests
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mocks
jest.mock("@prisma/client", () => {
  const mPrisma = {
    visitors_schedule: { findUnique: jest.fn(), update: jest.fn() },
    visitor_entry_logs: { findFirst: jest.fn(), update: jest.fn(), create: jest.fn() },
    visitor_feedback: { findFirst: jest.fn() },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});
jest.mock("next-auth/next");
jest.mock("@/app/utils/sendEmail", () => ({
  sendEmail: jest.fn(),
}));

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
const mockGetServerSession = getServerSession as jest.Mock;
const mockSendEmail = sendEmail as jest.Mock;

// Cast all Prisma methods to jest.Mock for type safety
const mockFindUnique = mockPrisma.visitors_schedule.findUnique as jest.Mock;
const mockUpdateSchedule = mockPrisma.visitors_schedule.update as jest.Mock;
const mockFindFirstEntryLog = mockPrisma.visitor_entry_logs.findFirst as jest.Mock;
const mockUpdateEntryLog = mockPrisma.visitor_entry_logs.update as jest.Mock;
const mockCreateEntryLog = mockPrisma.visitor_entry_logs.create as jest.Mock;
const mockFindFirstFeedback = mockPrisma.visitor_feedback.findFirst as jest.Mock;

describe("updateEntryExitStatus", () => {
  const basePayload = {
    visitorId: 1,
    scheduleId: 1,
    securityId: 1,
    action: "updateOneTime" as const,
    entryChecked: true,
    exitChecked: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { role: "admin" },
    });
  });

  it("returns 401 if not authenticated", async () => {
    mockGetServerSession.mockResolvedValueOnce(null);
    const result = await updateEntryExitStatus(basePayload);
    expect(result.code).toBe(401);
    expect(result.success).toBe(false);
  });

  it("returns 403 if user role is not allowed", async () => {
    mockGetServerSession.mockResolvedValueOnce({ user: { role: "visitor" } });
    const result = await updateEntryExitStatus(basePayload);
    expect(result.code).toBe(403);
    expect(result.success).toBe(false);
  });

  it("returns 404 if schedule not found", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const result = await updateEntryExitStatus(basePayload);
    expect(result.code).toBe(404);
    expect(result.success).toBe(false);
  });

  describe("one-time visitor", () => {
    const schedule = {
      id: 1,
      visitor_type: "one-time",
      visitor_exit_date: null,
      status: "active",
      visitor_email: "test@example.com",
    };

    beforeEach(() => {
      mockFindUnique.mockResolvedValue(schedule as any);
    });

    it("logs entry if entryChecked is true and no existing log", async () => {
      mockFindFirstEntryLog.mockResolvedValueOnce(null);
      mockCreateEntryLog.mockResolvedValueOnce({});
      const result = await updateEntryExitStatus(basePayload);
      expect(result.success).toBe(true);
      expect(mockCreateEntryLog).toHaveBeenCalled();
    });

    it("logs exit if exitChecked is true and entry exists", async () => {
      const log = { id: 1, entry_time: new Date(), exit_time: null };
      mockFindFirstEntryLog.mockResolvedValueOnce(log as any);
      mockUpdateEntryLog.mockResolvedValueOnce({});
      const payload = { ...basePayload, entryChecked: false, exitChecked: true, action: "updateOneTime" as const };
      const result = await updateEntryExitStatus(payload);
      expect(result.success).toBe(true);
      expect(mockUpdateEntryLog).toHaveBeenCalled();
    });

    it("logs entry and exit if both checked and no log", async () => {
      mockFindFirstEntryLog.mockResolvedValueOnce(null);
      mockCreateEntryLog.mockResolvedValueOnce({});
      mockUpdateSchedule.mockResolvedValueOnce({});
      mockSendEmail.mockResolvedValueOnce({});
      const payload = { ...basePayload, entryChecked: true, exitChecked: true, action: "updateOneTime" as const };
      const result = await updateEntryExitStatus(payload);
      expect(result.success).toBe(true);
      expect(mockCreateEntryLog).toHaveBeenCalled();
      expect(mockSendEmail).toHaveBeenCalled();
    });

    it("returns error if schedule is inactive or exit date passed", async () => {
      const inactiveSchedule = {
        ...schedule,
        status: "inactive",
        visitor_exit_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      };
      mockFindUnique.mockResolvedValueOnce(inactiveSchedule as any);
      mockUpdateSchedule.mockResolvedValueOnce({});
      const result = await updateEntryExitStatus(basePayload);
      expect(result.success).toBe(false);
      expect(result.code).toBe(403);
    });

    it("returns error for invalid action", async () => {
      const payload = { ...basePayload, action: "logEntry" as any };
      const result = await updateEntryExitStatus(payload);
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });
  });

  describe("recurring visitor", () => {
    const schedule = {
      id: 2,
      visitor_type: "recurring",
      visitor_exit_date: null,
      status: "active",
      visitor_email: "recurring@example.com",
    };

    beforeEach(() => {
      mockFindUnique.mockResolvedValue(schedule as any);
    });

    it("logs entry for recurring visitor", async () => {
      mockFindFirstEntryLog.mockResolvedValueOnce(null);
      mockCreateEntryLog.mockResolvedValueOnce({});
      const payload = { ...basePayload, action: "logEntry" as const };
      const result = await updateEntryExitStatus(payload);
      expect(result.success).toBe(true);
      expect(mockCreateEntryLog).toHaveBeenCalled();
    });

    it("returns error if already logged in", async () => {
      mockFindFirstEntryLog.mockResolvedValueOnce({ id: 1 });
      const payload = { ...basePayload, action: "logEntry" as const };
      const result = await updateEntryExitStatus(payload);
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });

    it("logs exit and sends feedback email if not given", async () => {
      mockFindFirstEntryLog
        .mockResolvedValueOnce({ id: 1, entry_time: new Date(), exit_time: null }) // openLog
        .mockResolvedValueOnce(null); // feedback not given
      mockUpdateEntryLog.mockResolvedValueOnce({});
      mockFindFirstFeedback.mockResolvedValueOnce(null);
      mockSendEmail.mockResolvedValueOnce({});
      const payload = { ...basePayload, action: "logExit" as const };
      const result = await updateEntryExitStatus(payload);
      expect(result.success).toBe(true);
      expect(mockSendEmail).toHaveBeenCalled();
    });

    it("returns error if no active entry log found for exit", async () => {
      mockFindFirstEntryLog.mockResolvedValueOnce(null); // no open log
      const payload = { ...basePayload, action: "logExit" as const };
      const result = await updateEntryExitStatus(payload);
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });

    it("returns error for invalid action", async () => {
      const payload = { ...basePayload, action: "updateOneTime" as any };
      const result = await updateEntryExitStatus(payload);
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });
  });

  it("returns error for unknown visitor type", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: 3,
      visitor_type: "unknown",
    } as any);
    const result = await updateEntryExitStatus(basePayload);
    expect(result.success).toBe(false);
    expect(result.code).toBe(400);
  });

});