// __tests__/actions/blacklistActions.test.ts

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { BlacklistVisitorAPI } from "@/app/api/blacklist/create-update/route"; // Adjust path
import { deleteBlacklistVisitor } from "@/app/api/blacklist/[id]/route"; // Adjust path
import {
  blacklistInfo,
  getblacklistInfo,
} from "@/app/api/blacklist/list/route"; // Adjust path
import { authOptions } from "@/lib/auth"; // Assuming this is the correct path

// --- Mock Prisma Client ---
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    blacklist_visitors: {
      // Added blacklist_visitors mocks
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    // Include other models if tested in the same file from previous examples
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    visitor_feedback: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    visitors_schedule: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
    visitor_entry_logs: { findMany: jest.fn() },
    // Mock the $transaction method
    $transaction: jest.fn().mockImplementation(async (callback) => {
      const mockTx = {
        blacklist_visitors: {
          // Mock methods within transaction
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
        // Include other models if used in other transactions tested here
        visitors_schedule: { update: jest.fn(), delete: jest.fn() },
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

// --- Console Silencing (Optional but recommended) ---
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  jest.clearAllMocks();
  // Default mock for getServerSession returning a user
  mockGetServerSession.mockResolvedValue({
    user: { id: "99" }, // Provide a default mock user ID
  });
  // Suppress console output during tests
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  // Restore console output after each test
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
// --- End Console Silencing ---

// --- Test Suite for BlacklistVisitorAPI ---
describe("BlacklistVisitorAPI Action", () => {
  const commonData = {
    reason: "Test Reason",
    status: "Active",
    resident_id: 1,
    visitor_id: 10,
    security_id: 5, // Assuming security_id is optional or handled
  };
  const createData = { ...commonData, type: "true" }; // type 'true' means create
  const updateData = { ...commonData, type: "false", id: 99 }; // type 'false' means update
  const mockCreatedEntry = { id: 100, ...commonData };
  const mockUpdatedEntry = { id: updateData.id, ...commonData };

  it('should successfully create a blacklist entry when type is "true"', async () => {
    // Arrange
    const mockTx = {
      blacklist_visitors: {
        create: jest.fn().mockResolvedValue(mockCreatedEntry),
        update: jest.fn(),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback) => await callback(mockTx)
    );

    // Act
    const result = await BlacklistVisitorAPI(createData);

    // Assert
    expect(result).toEqual({
      success: true,
      code: 200,
      message: "Blacklist Visitor created successfully", // Message might need adjustment if it changes based on create/update
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.blacklist_visitors.create).toHaveBeenCalledWith({
      data: {
        resident_id: createData.resident_id,
        security_id: createData.security_id,
        visitor_id: createData.visitor_id,
        reason: createData.reason,
        status: createData.status,
      },
    });
    expect(mockTx.blacklist_visitors.update).not.toHaveBeenCalled();
  });

  it('should successfully update a blacklist entry when type is "false"', async () => {
    // Arrange
    const mockTx = {
      blacklist_visitors: {
        create: jest.fn(),
        update: jest.fn().mockResolvedValue(mockUpdatedEntry),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback) => await callback(mockTx)
    );

    // Act
    const result = await BlacklistVisitorAPI(updateData);

    // Assert
    expect(result).toEqual({
      success: true,
      code: 200,
      message: "Blacklist Visitor created successfully", // Adjust message if needed
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.blacklist_visitors.update).toHaveBeenCalledWith({
      where: { id: updateData.id },
      data: { reason: updateData.reason }, // Only reason is updated in the 'false' case
    });
    expect(mockTx.blacklist_visitors.create).not.toHaveBeenCalled();
  });

  it("should return 400 if required fields are missing", async () => {
    const missingFields = [
      "reason",
      "status",
      "type",
      "resident_id",
      "visitor_id",
    ];
    for (const field of missingFields) {
      const incompleteData = { ...createData };
      delete (incompleteData as any)[field]; // Remove one required field

      const result = await BlacklistVisitorAPI(incompleteData);

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toContain("Missing required fields");
      expect(prisma.$transaction).not.toHaveBeenCalled();
      jest.clearAllMocks(); // Clear mocks for the next iteration
    }
  });

  it("should return 500 if transaction fails during create", async () => {
    // Arrange
    const dbError = new Error("Create failed in transaction");
    const mockTx = {
      blacklist_visitors: {
        create: jest.fn().mockRejectedValue(dbError),
        update: jest.fn(),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback) => await callback(mockTx)
    );

    // Act
    const result = await BlacklistVisitorAPI(createData);

    // Assert
    expect(result).toEqual({
      success: false,
      code: 500,
      message: `Server error: ${dbError.message}`,
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("should return 500 if transaction fails during update", async () => {
    // Arrange
    const dbError = new Error("Update failed in transaction");
    const mockTx = {
      blacklist_visitors: {
        create: jest.fn(),
        update: jest.fn().mockRejectedValue(dbError),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback) => await callback(mockTx)
    );

    // Act
    const result = await BlacklistVisitorAPI(updateData);

    // Assert
    expect(result).toEqual({
      success: false,
      code: 500,
      message: `Server error: ${dbError.message}`,
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});

// --- Test Suite for deleteBlacklistVisitor ---
describe("deleteBlacklistVisitor Action", () => {
  const blacklistId = 55;
  const userId = 123; // Consistent with default mock session

  beforeEach(() => {
    // Reset mocks and specifically set user ID for this suite's default
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: userId.toString() } }); // Ensure user ID matches
    console.log = jest.fn();
    console.error = jest.fn();
  });

  it("should successfully delete a blacklist entry", async () => {
    // Arrange
    const mockTx = {
      blacklist_visitors: {
        delete: jest.fn().mockResolvedValue({ id: blacklistId }),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback) => await callback(mockTx)
    );

    // Act
    const result = await deleteBlacklistVisitor(blacklistId);

    // Assert
    expect(result).toEqual({
      message: "Schedule deleted successfully",
      success: true,
    });
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.blacklist_visitors.delete).toHaveBeenCalledWith({
      where: { id: blacklistId },
    });
  });

  it("should return 401 Unauthorized if session is invalid", async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null); // No session

    // Act
    const result = await deleteBlacklistVisitor(blacklistId);

    // Assert
    expect(result).toEqual({
      success: false,
      code: 401,
      message: "Unauthorized",
    });
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should throw error if transaction fails during delete", async () => {
    // Arrange
    const dbError = new Error("Delete failed in transaction");
    const mockTx = {
      blacklist_visitors: { delete: jest.fn().mockRejectedValue(dbError) },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback) => await callback(mockTx)
    );

    // Act & Assert
    await expect(deleteBlacklistVisitor(blacklistId)).rejects.toThrow(
      "Error deleting schedule"
    );
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.blacklist_visitors.delete).toHaveBeenCalledWith({
      where: { id: blacklistId },
    });
  });
});

// --- Test Suite for blacklistInfo (List All) ---
describe("blacklistInfo Action", () => {
  const mockBlacklist = [
    {
      id: 1,
      visitor_id: 10,
      reason: "Reason A",
      visitiors: { id: 10, visitor_first_name: "John" },
    },
    {
      id: 2,
      visitor_id: 11,
      reason: "Reason B",
      visitiors: { id: 11, visitor_first_name: "Jane" },
    },
  ];
  const userId = 456;

  beforeEach(() => {
    // Reset mocks and specifically set user ID for this suite's default
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: userId.toString() } }); // Ensure user ID matches
    console.log = jest.fn();
    console.error = jest.fn();
  });

  it("should return a list of all blacklist entries with visitor details", async () => {
    // Arrange
    (prisma.blacklist_visitors.findMany as jest.Mock).mockResolvedValue(
      mockBlacklist
    );

    // Act
    const result = await blacklistInfo();

    // Assert
    expect(result).toEqual(mockBlacklist);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.blacklist_visitors.findMany).toHaveBeenCalledWith({
      include: { visitiors: true },
    });
  });

  it("should return an empty array if no blacklist entries exist", async () => {
    // Arrange
    (prisma.blacklist_visitors.findMany as jest.Mock).mockResolvedValue([]);

    // Act
    const result = await blacklistInfo();

    // Assert
    expect(result).toEqual([]);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.blacklist_visitors.findMany).toHaveBeenCalledWith({
      include: { visitiors: true },
    });
  });

  it("should return the error object if prisma findMany fails", async () => {
    // Arrange
    const dbError = new Error("Failed to fetch blacklist");
    (prisma.blacklist_visitors.findMany as jest.Mock).mockRejectedValue(
      dbError
    );

    // Act
    const result = await blacklistInfo();

    // Assert
    expect(result).toBeInstanceOf(Error);
    expect(result).toEqual(dbError);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.blacklist_visitors.findMany).toHaveBeenCalledWith({
      include: { visitiors: true },
    });
  });

  it("should proceed even if session is null (userid not used in query)", async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    (prisma.blacklist_visitors.findMany as jest.Mock).mockResolvedValue(
      mockBlacklist
    );

    // Act
    const result = await blacklistInfo();

    // Assert
    expect(result).toEqual(mockBlacklist); // Should still return data
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.blacklist_visitors.findMany).toHaveBeenCalledTimes(1);
  });
});

// --- Test Suite for getblacklistInfo (Get Single by Visitor ID) ---
describe("getblacklistInfo Action", () => {
  const visitorId = 77;
  const mockEntry = {
    id: 88,
    visitor_id: visitorId,
    reason: "Specific reason",
    visitiors: {
      id: visitorId,
      visitor_first_name: "Specific",
      visitor_last_name: "Visitor",
    },
  };
  const userId = 789;

  beforeEach(() => {
    // Reset mocks and specifically set user ID for this suite's default
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: userId.toString() } }); // Ensure user ID matches
    console.log = jest.fn();
    console.error = jest.fn();
  });

  it("should return the blacklist entry if found by visitor ID", async () => {
    // Arrange
    (prisma.blacklist_visitors.findUnique as jest.Mock).mockResolvedValue(
      mockEntry
    );

    // Act
    const result = await getblacklistInfo(visitorId);

    // Assert
    expect(result).toEqual(mockEntry);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.blacklist_visitors.findUnique).toHaveBeenCalledWith({
      where: { visitor_id: visitorId },
      include: { visitiors: true },
    });
  });

  it("should return null if no blacklist entry is found for the visitor ID", async () => {
    // Arrange
    (prisma.blacklist_visitors.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    const result = await getblacklistInfo(visitorId);

    // Assert
    expect(result).toBeNull();
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.blacklist_visitors.findUnique).toHaveBeenCalledWith({
      where: { visitor_id: visitorId },
      include: { visitiors: true },
    });
  });

  it("should return the error object if prisma findUnique fails", async () => {
    // Arrange
    const dbError = new Error("Failed to fetch specific blacklist entry");
    (prisma.blacklist_visitors.findUnique as jest.Mock).mockRejectedValue(
      dbError
    );

    // Act
    const result = await getblacklistInfo(visitorId);

    // Assert
    expect(result).toBeInstanceOf(Error);
    expect(result).toEqual(dbError);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.blacklist_visitors.findUnique).toHaveBeenCalledWith({
      where: { visitor_id: visitorId },
      include: { visitiors: true },
    });
  });

  it("should proceed even if session is null (userid not used in query)", async () => {
    // Arrange
    mockGetServerSession.mockResolvedValue(null);
    (prisma.blacklist_visitors.findUnique as jest.Mock).mockResolvedValue(
      mockEntry
    );

    // Act
    const result = await getblacklistInfo(visitorId);

    // Assert
    expect(result).toEqual(mockEntry); // Should still return data
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.blacklist_visitors.findUnique).toHaveBeenCalledTimes(1);
  });
});
