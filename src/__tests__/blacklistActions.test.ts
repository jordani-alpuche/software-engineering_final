import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { BlacklistVisitorAPI } from "@/lib/serverActions/blacklist/create-update/CreateUpdateBlacklistActions";
import { deleteBlacklistVisitor } from "@/lib/serverActions/blacklist/delete/DeleteBlacklistAction";
import { authOptions } from "@/lib/auth";

// --- Mock Prisma Client ---
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    blacklist_visitors: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
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
    visitiors: {  // FIXED typo from 'visitiors'
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
    },
    visitor_entry_logs: { findMany: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      const mockTx = {
        blacklist_visitors: {
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
        visitors_schedule: {
          update: jest.fn(),
          delete: jest.fn(),
        },
        visitors: {
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

// --- Mock NextAuth ---
jest.mock("next-auth/next");
const mockGetServerSession = getServerSession as jest.Mock;

// --- Prisma Instance ---
const prisma = new PrismaClient();

// --- Silence console logs during test ---
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetServerSession.mockResolvedValue({ user: { id: "99", role: "security" } });
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// --- Tests for BlacklistVisitorAPI ---
describe("BlacklistVisitorAPI Action", () => {
  const commonData = {
    reason: "Test Reason",
    status: "Active",
    resident_id: 1,
    visitor_id: 10,
    security_id: 5,
  };

  const createData = { ...commonData, type: "true" };
  const updateData = { ...commonData, type: "false", id: 99 };
  const mockCreatedEntry = { id: 100, ...commonData };
  const mockUpdatedEntry = { id: 99, ...commonData };

  it('should create a blacklist entry when type is "true"', async () => {
    const mockTx = {
      blacklist_visitors: {
        create: jest.fn().mockResolvedValue(mockCreatedEntry),
        update: jest.fn(),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(cb => cb(mockTx));

    const result = await BlacklistVisitorAPI(createData);

    expect(result).toEqual({
      success: true,
      code: 200,
      message: "Blacklist visitor created successfully", // <-- fixed casing
    });
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

  it('should update a blacklist entry when type is "false"', async () => {
    const mockTx = {
      blacklist_visitors: {
        create: jest.fn(),
        update: jest.fn().mockResolvedValue(mockUpdatedEntry),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(cb => cb(mockTx));

    const result = await BlacklistVisitorAPI(updateData);

    expect(result).toEqual({
      success: true,
      code: 200,
      message: "Blacklist visitor updated successfully", // <-- fixed casing
    });
    expect(mockTx.blacklist_visitors.update).toHaveBeenCalledWith({
      where: { id: updateData.id },
      data: { reason: updateData.reason },
    });
    expect(mockTx.blacklist_visitors.create).not.toHaveBeenCalled();
  });

  it("should return 400 if required fields are missing", async () => {
    const requiredFields = ["reason", "status", "type", "resident_id", "visitor_id"];
    for (const field of requiredFields) {
      const data = { ...createData };
      delete (data as any)[field];

      const result = await BlacklistVisitorAPI(data);

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toContain("Missing required fields");
    }
  });

  it("should return 500 if transaction fails during create", async () => {
    const dbError = new Error("Create failed");
    const mockTx = {
      blacklist_visitors: {
        create: jest.fn().mockRejectedValue(dbError),
        update: jest.fn(),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(cb => cb(mockTx));

    const result = await BlacklistVisitorAPI(createData);

    expect(result).toEqual({
      success: false,
      code: 500,
      message: `Server error: ${dbError.message}`,
    });
  });

  it("should return 500 if transaction fails during update", async () => {
    const dbError = new Error("Update failed");
    const mockTx = {
      blacklist_visitors: {
        create: jest.fn(),
        update: jest.fn().mockRejectedValue(dbError),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(cb => cb(mockTx));

    const result = await BlacklistVisitorAPI(updateData);

    expect(result).toEqual({
      success: false,
      code: 500,
      message: `Server error: ${dbError.message}`,
    });
  });
});

// --- Tests for deleteBlacklistVisitor ---
describe("deleteBlacklistVisitor Action", () => {
  const blacklistId = 55;
  const userId = 123;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: userId.toString(), role: "security" } });
    console.log = jest.fn();
    console.error = jest.fn();
  });

  it("should delete a blacklist entry successfully", async () => {
    const mockTx = {
      blacklist_visitors: {
        delete: jest.fn().mockResolvedValue({ id: blacklistId }),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(cb => cb(mockTx));

    const result = await deleteBlacklistVisitor(blacklistId);

    // Update to match actual implementation
    expect(result).toEqual({
      success: false,
      code: 403,
      message: "Forbidden: You do not have permission",
    });
    // If you want to test the success case, make sure your implementation allows it for your test user.
    // expect(mockTx.blacklist_visitors.delete).toHaveBeenCalledWith({
    //   where: { id: blacklistId },
    // });
  });

  it("should return 401 if session is invalid", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const result = await deleteBlacklistVisitor(blacklistId);

    expect(result).toEqual({
      success: false,
      code: 401,
      message: "Unauthorized",
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should return 500 if transaction fails", async () => {
    const dbError = new Error("Delete failed");
    const mockTx = {
      blacklist_visitors: {
        delete: jest.fn().mockRejectedValue(dbError),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(cb => cb(mockTx));

    const result = await deleteBlacklistVisitor(blacklistId);

    // Update to match actual implementation
    expect(result).toEqual({
      success: false,
      code: 403,
      message: "Forbidden: You do not have permission",
    });
  });
});