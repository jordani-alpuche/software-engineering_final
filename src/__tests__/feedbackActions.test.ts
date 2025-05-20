// __tests__/actions/feedbackActions.test.ts

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { createVisitorFeedback } from "@/lib/serverActions/feedback/create/CreateFeedbackActions"; // Adjust import path
import {
  getVisitorSchedule,
  getAllVisitorFeedback,
} from "@/lib/serverActions/feedback/gets/GetFeebackActions"; // Adjust import path
import { authOptions } from "@/lib/auth"; // Assuming this is the correct path

// --- Mock Prisma Client ---
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    visitor_feedback: {
      // Added visitor_feedback mocks
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    visitors_schedule: {
      findUnique: jest.fn(),
      // Add other methods if needed by other tests/functions
    },
    visitiors: {
      // Keep existing mocks if this file tests other things too
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    blacklist_visitors: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    visitor_entry_logs: {
      findMany: jest.fn(),
    },
    // Mock the $transaction method
    $transaction: jest.fn().mockImplementation(async (callback) => {
      const mockTx = {
        visitor_feedback: {
          create: jest.fn(), // Mock create within transaction
          // Add other models/methods used within transactions if needed
        },
        // Include other models if used in other transactions tested here
        visitors_schedule: { update: jest.fn() },
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
      // Simulate successful transaction execution by default
      return await callback(mockTx);
    }),
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

// --- Mock NextAuth ---
jest.mock("next-auth/next");
const mockGetServerSession = getServerSession as jest.Mock;

// --- Prisma Instance (using the mock) ---
const prisma = new PrismaClient();

// --- Helper to reset mocks before each test ---
beforeEach(() => {
  jest.clearAllMocks();
  // Default mock for getServerSession returning a user (needed for getVisitorSchedule)
  mockGetServerSession.mockResolvedValue({
    user: { id: 198 }, // Provide a default mock user ID
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
    // Arrange: Mock the transaction and the create call within it
    const mockTx = {
      visitor_feedback: {
        create: jest.fn().mockResolvedValue(mockCreatedFeedback),
      },
      // Add other models if the transaction involves more
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback) => await callback(mockTx)
    );

    // Act
    const result = await createVisitorFeedback(validFeedbackData);

    // Assert
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
    // Arrange: Mock the transaction to throw an error
    const dbError = new Error("DB transaction failed");
    (prisma.$transaction as jest.Mock).mockRejectedValue(dbError);

    // Act
    const result = await createVisitorFeedback(validFeedbackData);

    // Assert
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
  const userId = "mock-user-id-feedback"; // Match the default mock session

  it('should return "exists" if feedback for the schedule ID already exists', async () => {
    // Arrange
    (prisma.visitor_feedback.findFirst as jest.Mock).mockResolvedValue({
      id: 5,
      visitor_schedule_id: scheduleId /* other fields */,
    });

    // Act
    const result = await getVisitorSchedule(scheduleId);

    // Assert
    expect(result).toBe("exists");
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitor_feedback.findFirst).toHaveBeenCalledWith({
      where: { visitor_schedule_id: scheduleId },
    });
    expect(prisma.visitors_schedule.findUnique).not.toHaveBeenCalled(); // Should not proceed to get schedule
  });

  it("should return the schedule details if feedback does not exist and schedule is found", async () => {
    // Arrange
    const mockSchedule = {
      id: scheduleId,
      resident_id: 99, // Doesn't matter for this specific function's logic currently
      /* other fields */
      visitiors: [{ id: 30, visitor_first_name: "VisitorA" }],
      visitor_entry_logs: [],
    };
    (prisma.visitor_feedback.findFirst as jest.Mock).mockResolvedValue(null); // No feedback
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
      mockSchedule
    ); // Schedule found

    // Act
    const result = await getVisitorSchedule(scheduleId);

    // Assert
    expect(result).toEqual(mockSchedule);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
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
    // Arrange
    (prisma.visitor_feedback.findFirst as jest.Mock).mockResolvedValue(null); // No feedback
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(null); // Schedule not found

    // Act
    const result = await getVisitorSchedule(scheduleId);

    // Assert
    expect(result).toBeNull();
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
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
    // Arrange
    mockGetServerSession.mockResolvedValue(null); // Simulate no session
    const mockSchedule = { id: scheduleId /* ... */ };
    (prisma.visitor_feedback.findFirst as jest.Mock).mockResolvedValue(null); // No feedback
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
      mockSchedule
    ); // Schedule found

    // Act
    const result = await getVisitorSchedule(scheduleId);

    // Assert - The function doesn't use the session ID for these lookups, so it should proceed
    expect(result).toEqual(mockSchedule);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitor_feedback.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalledTimes(1);
  });
});

// --- Test Suite for getAllVisitorFeedback ---
describe("getAllVisitorFeedback Action", () => {
  it("should return a list of all feedback with schedule details", async () => {
    // Arrange
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

    // Act
    const result = await getAllVisitorFeedback();

    // Assert
    expect(result).toEqual(mockFeedbackList);
    expect(prisma.visitor_feedback.findMany).toHaveBeenCalledWith({
      include: {
        visitors_schedule: true,
      },
    });
  });

  it("should return an empty array if no feedback exists", async () => {
    // Arrange
    (prisma.visitor_feedback.findMany as jest.Mock).mockResolvedValue([]); // No feedback found

    // Act
    const result = await getAllVisitorFeedback();

    // Assert
    // The original code returns `feedback || null`. An empty array is truthy, so it should return []
    expect(result).toEqual([]);
    expect(prisma.visitor_feedback.findMany).toHaveBeenCalledWith({
      include: {
        visitors_schedule: true,
      },
    });
  });

  it("should propagate error if Prisma findMany fails", async () => {
    // Arrange
    const dbError = new Error("Failed to fetch feedback");
    (prisma.visitor_feedback.findMany as jest.Mock).mockRejectedValue(dbError);

    // Act & Assert
    // Since the function doesn't have a try/catch, the error will propagate
    await expect(getAllVisitorFeedback()).rejects.toThrow(dbError);
    expect(prisma.visitor_feedback.findMany).toHaveBeenCalledWith({
      include: {
        visitors_schedule: true,
      },
    });
  });
});
