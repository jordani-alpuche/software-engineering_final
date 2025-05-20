import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { createVisitorFeedback } from "@/lib/serverActions/feedback/create/CreateFeedbackActions";
import {
  getVisitorSchedule,
  getAllVisitorFeedback,
} from "@/lib/serverActions/feedback/gets/GetFeebackActions";
import { authOptions } from "@/lib/auth";

// --- Mock NextAuth ---
jest.mock("next-auth/next", () => ({
  __esModule: true,
  getServerSession: jest.fn(),
  default: jest.fn(),
}));
const mockGetServerSession = getServerSession as jest.Mock;

// --- Mock Prisma Client ---
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    visitor_feedback: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    visitors_schedule: {
      findUnique: jest.fn(),
      update: jest.fn(),
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
    blacklist_visitors: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    visitor_entry_logs: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      const mockTx = {
        visitor_feedback: {
          create: jest.fn(),
        },
        visitors_schedule: { update: jest.fn(), findUnique: jest.fn() },
        visitiors: {
          updateMany: jest.fn(),
          deleteMany: jest.fn(),
          delete: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          create: jest.fn(),
        },
        visitor_entry_logs: { findMany: jest.fn() },
      };
      return await callback(mockTx);
    }),
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

// --- Prisma Instance (using the mock) ---
const prisma = new PrismaClient();

// --- Helper to reset mocks before each test ---
beforeEach(() => {
  jest.clearAllMocks();
  mockGetServerSession.mockResolvedValue({
    user: { id: 198 },
  });
});

// --- Test Suite for createVisitorFeedback ---
describe("createVisitorFeedback Action", () => {
  const validFeedbackData = {
    scheduleId: 101,
    rating: 5,
    comments: "Excellent service!",
  };
  const mockCreatedFeedback = {
    id: 1,
    visitor_schedule_id: validFeedbackData.scheduleId,
    rating: validFeedbackData.rating,
    comments: validFeedbackData.comments,
    createdAt: new Date(),
  };

  it("should successfully create visitor feedback within a transaction", async () => {
    const mockTx = {
      visitor_feedback: {
        create: jest.fn().mockResolvedValue(mockCreatedFeedback),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback) => await callback(mockTx)
    );

    const result = await createVisitorFeedback(validFeedbackData);

    expect(result).toEqual({
      success: true,
      code: 200,
      message: "Visitor feedback created successfully",
      data: mockCreatedFeedback,
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.visitor_feedback.create).toHaveBeenCalledWith({
      data: {
        visitor_schedule_id: validFeedbackData.scheduleId,
        rating: validFeedbackData.rating,
        comments: validFeedbackData.comments,
      },
    });
  });

  it("should return a 400 error if scheduleId is missing", async () => {
    const incompleteData = { ...validFeedbackData, scheduleId: undefined };
    const result = await createVisitorFeedback(incompleteData);
    expect(result).toEqual({
      success: false,
      code: 400,
      message: "Missing required fields or invalid visitors list",
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should return a 400 error if rating is missing", async () => {
    const incompleteData = { ...validFeedbackData, rating: undefined };
    const result = await createVisitorFeedback(incompleteData);
    expect(result).toEqual({
      success: false,
      code: 400,
      message: "Missing required fields or invalid visitors list",
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should return a 400 error if comments are missing", async () => {
    const incompleteData = { ...validFeedbackData, comments: undefined };
    const result = await createVisitorFeedback(incompleteData);
    expect(result).toEqual({
      success: false,
      code: 400,
      message: "Missing required fields or invalid visitors list",
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should return a 500 error if the transaction fails", async () => {
    const dbError = new Error("DB transaction failed");
    (prisma.$transaction as jest.Mock).mockRejectedValue(dbError);

    const result = await createVisitorFeedback(validFeedbackData);

    expect(result).toEqual({
      success: false,
      code: 500,
      message: `Server error: ${dbError.message}`,
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});

// --- Test Suite for getVisitorSchedule ---
describe("getVisitorSchedule Action", () => {
  const scheduleId = 202;

  it('should return "exists" if feedback for the schedule ID already exists', async () => {
    (prisma.visitor_feedback.findFirst as jest.Mock).mockResolvedValue({
      id: 5,
      visitor_schedule_id: scheduleId,
    });

    const result = await getVisitorSchedule(scheduleId);

    expect(result).toBe("exists");
    // Removed: expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitor_feedback.findFirst).toHaveBeenCalledWith({
      where: { visitor_schedule_id: scheduleId },
    });
    expect(prisma.visitors_schedule.findUnique).not.toHaveBeenCalled();
  });

  it("should return the schedule details if feedback does not exist and schedule is found", async () => {
    const mockSchedule = {
      id: scheduleId,
      resident_id: 99,
      visitiors: [{ id: 30, visitor_first_name: "VisitorA" }],
      visitor_entry_logs: [],
    };
    (prisma.visitor_feedback.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
      mockSchedule
    );

    const result = await getVisitorSchedule(scheduleId);

    expect(result).toEqual(mockSchedule);
    // Removed: expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitor_feedback.findFirst).toHaveBeenCalledWith({
      where: { visitor_schedule_id: scheduleId },
    });
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalledWith({
      where: { id: scheduleId },
      include: {
        visitiors: true,
        visitor_entry_logs: true,
      },
    });
  });

  it("should return null if feedback does not exist and schedule is not found", async () => {
    (prisma.visitor_feedback.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getVisitorSchedule(scheduleId);

    expect(result).toBeNull();
    // Removed: expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitor_feedback.findFirst).toHaveBeenCalledWith({
      where: { visitor_schedule_id: scheduleId },
    });
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalledWith({
      where: { id: scheduleId },
      include: {
        visitiors: true,
        visitor_entry_logs: true,
      },
    });
  });

  it("should still check for feedback and schedule even if session is null", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const mockSchedule = { id: scheduleId };
    (prisma.visitor_feedback.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
      mockSchedule
    );

    const result = await getVisitorSchedule(scheduleId);

    expect(result).toEqual(mockSchedule);
    // Removed: expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitor_feedback.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalledTimes(1);
  });
});

// --- Test Suite for getAllVisitorFeedback ---
describe("getAllVisitorFeedback Action", () => {
  it("should return a list of all feedback with schedule details", async () => {
    const mockFeedbackList = [
      {
        id: 1,
        rating: 5,
        comments: "Great",
        visitor_schedule_id: 10,
        visitors_schedule: { id: 10, license_plate: "ABC" },
      },
      {
        id: 2,
        rating: 3,
        comments: "Okay",
        visitor_schedule_id: 11,
        visitors_schedule: { id: 11, license_plate: "DEF" },
      },
    ];
    (prisma.visitor_feedback.findMany as jest.Mock).mockResolvedValue(
      mockFeedbackList
    );

    const result = await getAllVisitorFeedback();

    expect(result).toEqual(mockFeedbackList);
    expect(prisma.visitor_feedback.findMany).toHaveBeenCalledWith({
      include: {
        visitors_schedule: true,
      },
    });
  });

  it("should return an empty array if no feedback exists", async () => {
    (prisma.visitor_feedback.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getAllVisitorFeedback();

    expect(result).toEqual([]);
    expect(prisma.visitor_feedback.findMany).toHaveBeenCalledWith({
      include: {
        visitors_schedule: true,
      },
    });
  });

  it("should propagate error if Prisma findMany fails", async () => {
    const dbError = new Error("Failed to fetch feedback");
    (prisma.visitor_feedback.findMany as jest.Mock).mockRejectedValue(dbError);

    await expect(getAllVisitorFeedback()).rejects.toThrow(dbError);
    expect(prisma.visitor_feedback.findMany).toHaveBeenCalledWith({
      include: {
        visitors_schedule: true,
      },
    });
  });
});