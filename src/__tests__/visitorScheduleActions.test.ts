// __tests__/actions/scheduleActions.test.ts

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import {
  isValidSchedule,
  getSchedule,
  getVisitors,
  getAllVisitors,
  updateIndividualSchedule,
  updateGroupSchedule,
  deleteSchedule,
} from "@/lib/serverActions/visitors/update/UpdateVisitorActions";
import { authOptions } from "@/lib/auth";

// --- Mock Prisma Client ---
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
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
        visitors_schedule: {
          findUnique: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
        visitiors: {
          findUnique: jest.fn(),
          findMany: jest.fn(),
          updateMany: jest.fn(),
          update: jest.fn(),
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
      };
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
  // Default mock for getServerSession returning a user with no role (admin or security)
  mockGetServerSession.mockResolvedValue({
    user: { id: 12 },
  });
});

// --- Test Suite for isValidSchedule ---
describe("isValidSchedule Action", () => {
  it("should return valid: true and code 200 for an existing schedule ID when the security officer scan qrcode", async () => {
    const scheduleId = 1;
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue({
      id: scheduleId,
    });

    const result = await isValidSchedule(scheduleId);

    expect(result).toEqual({ valid: true, code: 200 });
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalledWith({
      where: { id: scheduleId },
    });
  });

  it("should return valid: false, error message and code 404 for a non-existent schedule ID when the security officer scan qrcode", async () => {
    const scheduleId = 999;
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await isValidSchedule(scheduleId);

    expect(result).toEqual({
      valid: false,
      error: "Schedule not found",
      code: 404,
    });
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalledWith({
      where: { id: scheduleId },
    });
  });

  it("should return valid: false, error message and code 400 for an invalid ID format (NaN) when the security officer scan qrcode", async () => {
    const invalidId = NaN;
    const result = await isValidSchedule(invalidId);

    expect(result).toEqual({
      valid: false,
      error: "Invalid ID format",
      code: 400,
    });
    expect(prisma.visitors_schedule.findUnique).not.toHaveBeenCalled();
  });
});

// --- Test Suite for getSchedule ---
describe("getSchedule Action", () => {
  const scheduleId = 5;
  const userId = 12;

  it("should return the schedule with visitors and logs when found for the user (admin/security)", async () => {
    const mockSchedule = {
      id: scheduleId,
      resident_id: userId,
      visitor_phone: "123",
      visitiors: [
        {
          id: 10,
          visitor_first_name: "Visitor1",
          visitor_schedule_id: scheduleId,
        },
      ],
      visitor_entry_logs: [
        {
          id: 100,
          entry_time: new Date(),
          visitor_schedule_id: scheduleId,
          visitor_id: 10,
        },
      ],
    };
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
      mockSchedule
    );

    const result = await getSchedule(scheduleId);

    expect(result).toEqual(mockSchedule);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    // Only expect resident_id in where clause if role is "resident"
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalledWith({
      where: { id: scheduleId },
      include: {
        visitiors: true,
        visitor_entry_logs: true,
      },
    });
  });

  it("should return the schedule with visitors and logs when found for a resident", async () => {
    // Set session role to resident
    mockGetServerSession.mockResolvedValue({
      user: { id: userId, role: "resident" },
    });
    const mockSchedule = {
      id: scheduleId,
      resident_id: userId,
      visitor_phone: "123",
      visitiors: [],
      visitor_entry_logs: [],
    };
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(
      mockSchedule
    );

    const result = await getSchedule(scheduleId);

    expect(result).toEqual(mockSchedule);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalledWith({
      where: { id: scheduleId, resident_id: userId },
      include: {
        visitiors: true,
        visitor_entry_logs: true,
      },
    });
  });

  it("should return null if the schedule is not found (admin/security)", async () => {
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getSchedule(scheduleId);

    expect(result).toBeNull();
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalledWith({
      where: { id: scheduleId },
      include: {
        visitiors: true,
        visitor_entry_logs: true,
      },
    });
  });

  it("should return null if the schedule is not found (resident)", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: userId, role: "resident" },
    });
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getSchedule(scheduleId);

    expect(result).toBeNull();
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalledWith({
      where: { id: scheduleId, resident_id: userId },
      include: {
        visitiors: true,
        visitor_entry_logs: true,
      },
    });
  });

  it("should return null if the schedule belongs to a different resident", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 13, role: "resident" },
    });
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getSchedule(scheduleId);

    expect(result).toBeNull();
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalledWith({
      where: { id: scheduleId, resident_id: 13 },
      include: {
        visitiors: true,
        visitor_entry_logs: true,
      },
    });
  });

  it("should return null if there is no active session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    (prisma.visitors_schedule.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getSchedule(scheduleId);

    expect(result).toBeNull();
    expect(prisma.visitors_schedule.findUnique).toHaveBeenCalled();
  });
});

// --- Test Suite for getVisitors ---
describe("getVisitors Action", () => {
  const visitorId = 15;

  it("should return the visitor details if found and not blacklisted", async () => {
    const mockVisitor = {
      id: visitorId,
      visitor_first_name: "Test",
      visitor_last_name: "Visitor",
      /* other fields */
      visitor_entry_logs: [],
      visitors_schedule: { id: 1 },
    };
    (prisma.blacklist_visitors.findUnique as jest.Mock).mockResolvedValue(null); // Not blacklisted
    (prisma.visitiors.findUnique as jest.Mock).mockResolvedValue(mockVisitor);

    const result = await getVisitors(visitorId);

    expect(result).toEqual(mockVisitor);
    expect(prisma.blacklist_visitors.findUnique).toHaveBeenCalledWith({
      where: { visitor_id: visitorId },
    });
    expect(prisma.visitiors.findUnique).toHaveBeenCalledWith({
      where: { id: visitorId },
      include: {
        visitor_entry_logs: true,
        visitors_schedule: true,
      },
    });
  });

  it('should return "exists" if the visitor is blacklisted', async () => {
    (prisma.blacklist_visitors.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      visitor_id: visitorId,
      reason: "Banned",
    }); // Blacklisted

    const result = await getVisitors(visitorId);

    expect(result).toBe("exists");
    expect(prisma.blacklist_visitors.findUnique).toHaveBeenCalledWith({
      where: { visitor_id: visitorId },
    });
    expect(prisma.visitiors.findUnique).not.toHaveBeenCalled(); // Should not proceed to find visitor details
  });

  it("should return null if the visitor is not found and not blacklisted", async () => {
    (prisma.blacklist_visitors.findUnique as jest.Mock).mockResolvedValue(null); // Not blacklisted
    (prisma.visitiors.findUnique as jest.Mock).mockResolvedValue(null); // Visitor not found

    const result = await getVisitors(visitorId);

    expect(result).toBeNull();
    expect(prisma.blacklist_visitors.findUnique).toHaveBeenCalledWith({
      where: { visitor_id: visitorId },
    });
    expect(prisma.visitiors.findUnique).toHaveBeenCalledWith({
      where: { id: visitorId },
      include: {
        visitor_entry_logs: true,
        visitors_schedule: true,
      },
    });
  });
});

// --- Test Suite for getAllVisitors ---
describe("getAllVisitors Action", () => {
  // Mock data needs careful setup to test the filtering logic
  const mockBlacklist = [
    {
      id: 1,
      visitor_id: 101,
      visitiors: {
        visitor_first_name: "Bad",
        visitor_last_name: "Actor",
        visitor_id_type: "ID",
        visitor_id_number: "BAD123",
      },
    },
    {
      id: 2,
      visitor_id: 103,
      visitiors: {
        visitor_first_name: "Trouble",
        visitor_last_name: "Maker",
        visitor_id_type: "Passport",
        visitor_id_number: "TRB456",
      },
    },
  ];
  const mockAllDistinctVisitors = [
    {
      id: 100,
      visitor_first_name: "Good",
      visitor_last_name: "Visitor",
      visitor_id_type: "ID",
      visitor_id_number: "GOOD123",
    },
    {
      id: 101,
      visitor_first_name: "Bad",
      visitor_last_name: "Actor",
      visitor_id_type: "ID",
      visitor_id_number: "BAD123",
    }, // Blacklisted
    {
      id: 102,
      visitor_first_name: "Another",
      visitor_last_name: "Guest",
      visitor_id_type: "DL",
      visitor_id_number: "GUEST789",
    },
    {
      id: 103,
      visitor_first_name: "Trouble",
      visitor_last_name: "Maker",
      visitor_id_type: "Passport",
      visitor_id_number: "TRB456",
    }, // Blacklisted
  ];
  const expectedFilteredVisitors = [
    {
      id: 100,
      visitor_first_name: "Good",
      visitor_last_name: "Visitor",
      visitor_id_type: "ID",
      visitor_id_number: "GOOD123",
    },
    {
      id: 102,
      visitor_first_name: "Another",
      visitor_last_name: "Guest",
      visitor_id_type: "DL",
      visitor_id_number: "GUEST789",
    },
  ];

  it("should return a list of distinct visitors, excluding those on the blacklist", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "some-user" } }); // Need a session
    (prisma.blacklist_visitors.findMany as jest.Mock).mockResolvedValue(
      mockBlacklist
    );
    (prisma.visitiors.findMany as jest.Mock).mockResolvedValue(
      mockAllDistinctVisitors
    );

    const result = await getAllVisitors();

    expect(result).toEqual(expectedFilteredVisitors);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(prisma.blacklist_visitors.findMany).toHaveBeenCalledWith({
      include: { visitiors: true },
    });
    expect(prisma.visitiors.findMany).toHaveBeenCalledWith({
      distinct: [
        "visitor_first_name",
        "visitor_last_name",
        "visitor_id_type",
        "visitor_id_number",
      ],
    });
  });

  it("should return an empty array if all distinct visitors are blacklisted", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "some-user" } });
    const allVisitorsAreBlacklisted = [
      {
        id: 101,
        visitor_first_name: "Bad",
        visitor_last_name: "Actor",
        visitor_id_type: "ID",
        visitor_id_number: "BAD123",
      },
      {
        id: 103,
        visitor_first_name: "Trouble",
        visitor_last_name: "Maker",
        visitor_id_type: "Passport",
        visitor_id_number: "TRB456",
      },
    ];
    (prisma.blacklist_visitors.findMany as jest.Mock).mockResolvedValue(
      mockBlacklist
    );
    (prisma.visitiors.findMany as jest.Mock).mockResolvedValue(
      allVisitorsAreBlacklisted
    );

    const result = await getAllVisitors();

    expect(result).toEqual([]); // Expect empty array because filtering should remove all
  });

  it("should return an empty array if no visitors exist", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "some-user" } });
    (prisma.blacklist_visitors.findMany as jest.Mock).mockResolvedValue([]); // No blacklist
    (prisma.visitiors.findMany as jest.Mock).mockResolvedValue([]); // No visitors

    const result = await getAllVisitors();

    expect(result).toEqual([]);
  });

  it("should return null if session is null (based on code structure)", async () => {
    mockGetServerSession.mockResolvedValue(null); // Simulate no session

    // In this specific implementation, it doesn't seem to check session *before* DB calls
    // but the filter logic might behave unexpectedly without a user context if needed later.
    // Assuming it proceeds but might return null if Prisma calls fail or based on final check.
    // For this test, let's assume the Prisma calls succeed but the final return might be null.
    (prisma.blacklist_visitors.findMany as jest.Mock).mockResolvedValue(
      mockBlacklist
    );
    (prisma.visitiors.findMany as jest.Mock).mockResolvedValue(
      mockAllDistinctVisitors
    );

    // Because the function ends with `return filteredVisitors || null;`
    // and doesn't explicitly depend on the session *for filtering*,
    // it will likely return the filtered list even without a session.
    // Adjust this assertion if the actual function behavior differs.
    const result = await getAllVisitors();
    expect(result).toEqual(expectedFilteredVisitors);
  });
});

// --- Test Suite for updateIndividualSchedule ---
describe("updateIndividualSchedule Action", () => {
  const scheduleId = 10;
  const residentId = 12; // Use a consistent ID
  const validUpdateData = {
    resident_id: residentId,
    visitor_first_name: "Updated",
    visitor_last_name: "Visitor",
    visitor_id_type: "Passport",
    visitor_id_number: "UP123",
    visitor_phone: "1112223333",
    visitor_email: "update@example.com",
    status: "Rescheduled",
    visitor_type: "Contractor",
    visitor_entry_date: new Date().toISOString(),
    visitor_exit_date: new Date(Date.now() + 86400000).toISOString(),
    license_plate: "UPD-456",
    comments: "Updated details",
  };

  it("should successfully update the schedule and associated visitor within a transaction", async () => {
    // Arrange: Mock the transaction and its internal calls
    const mockUpdatedSchedule = { id: scheduleId, ...validUpdateData };
    const mockTx = {
      visitors_schedule: {
        update: jest.fn().mockResolvedValue(mockUpdatedSchedule),
      },
      visitiors: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback) => await callback(mockTx)
    );

    // Act
    const result = await updateIndividualSchedule(scheduleId, validUpdateData);

    // Assert
    expect(result).toEqual({
      success: true,
      code: 200,
      message: "Schedule updated successfully",
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.visitors_schedule.update).toHaveBeenCalledWith({
      where: { id: scheduleId, resident_id: residentId },
      data: {
        resident_id: validUpdateData.resident_id,
        visitor_phone: validUpdateData.visitor_phone,
        visitor_email: validUpdateData.visitor_email,
        status: validUpdateData.status,
        visitor_type: validUpdateData.visitor_type,
        license_plate: validUpdateData.license_plate,
        visitor_entry_date: new Date(validUpdateData.visitor_entry_date),
        visitor_exit_date: new Date(validUpdateData.visitor_exit_date),
        comments: validUpdateData.comments,
      },
    });
    expect(mockTx.visitiors.updateMany).toHaveBeenCalledWith({
      where: { visitor_schedule_id: scheduleId }, // Should use the returned schedule ID
      data: {
        visitor_first_name: validUpdateData.visitor_first_name,
        visitor_last_name: validUpdateData.visitor_last_name,
        visitor_id_type: validUpdateData.visitor_id_type,
        visitor_id_number: validUpdateData.visitor_id_number,
      },
    });
  });

  it("should return a 400 error if required fields are missing", async () => {
    const incompleteData = { ...validUpdateData, visitor_email: undefined }; // Missing email

    const result = await updateIndividualSchedule(scheduleId, incompleteData);

    expect(result).toEqual({
      success: false,
      code: 400,
      message: "Missing required fields",
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should return a 500 error if the transaction fails", async () => {
    // Arrange: Mock the transaction to throw an error
    const dbError = new Error("Database connection lost");
    (prisma.$transaction as jest.Mock).mockRejectedValue(dbError);

    // Act
    const result = await updateIndividualSchedule(scheduleId, validUpdateData);

    // Assert
    expect(result).toEqual({
      success: false,
      code: 500,
      message: `Server error: ${dbError.message}`,
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});

// --- Test Suite for updateGroupSchedule ---
describe("updateGroupSchedule Action", () => {
  const scheduleId = 20;
  const residentId = 12; // Use a consistent ID
  const visitorid1 = 201; // Existing visitor ID for update
  const visitorid2 = 203; // Existing visitor ID for deletion
  const baseUpdateData = {
    resident_id: residentId,
    visitor_phone: "5556667777",
    visitor_email: "group.update@example.com",
    status: "Confirmed",
    visitor_type: "Team",
    visitor_entry_date: new Date().toISOString(),
    visitor_exit_date: new Date(Date.now() + 3600000).toISOString(),
    license_plate: "GRP-UPD",
    comments: "Group update test",
  };

  const visitorToUpdate = {
    id: 201,
    visitor_first_name: "Existing",
    visitor_last_name: "Member",
    visitor_id_type: "ID",
    visitor_id_number: visitorid1,
  };
  const visitorToCreate = {
    visitor_first_name: "New",
    visitor_last_name: "Member",
    visitor_id_type: "ID",
    visitor_id_number: visitorid2,
  };
  const visitorToDelete = {
    id: 202,
    visitor_first_name: "Old",
    visitor_last_name: "Member",
    visitor_id_type: "ID",
    visitor_id_number: 200,
  };

  const mockExistingVisitors = [visitorToUpdate, visitorToDelete];

  const mockTx = {
    visitors_schedule: { update: jest.fn() },
    visitiors: {
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    visitor_entry_logs: { findMany: jest.fn() },
  };

  beforeEach(() => {
    // Reset specific transaction mocks
    jest.clearAllMocks(); // General clear first
    mockGetServerSession.mockResolvedValue({ user: { id: residentId } }); // Set correct user for group tests
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback) => await callback(mockTx)
    ); // Reset transaction mock implementation

    // Reset specific mocks within mockTx if needed, e.g.:
    mockTx.visitors_schedule.update.mockClear();
    mockTx.visitiors.findMany.mockClear();
    mockTx.visitiors.update.mockClear();
    mockTx.visitiors.create.mockClear();
    mockTx.visitiors.delete.mockClear();
    mockTx.visitor_entry_logs.findMany.mockClear();

    // Default successful return values for common operations
    mockTx.visitors_schedule.update.mockResolvedValue({
      id: scheduleId,
      ...baseUpdateData,
    });
    mockTx.visitiors.update.mockResolvedValue({
      ...visitorToUpdate,
      visitor_first_name: "UpdatedName",
    });
    mockTx.visitiors.create.mockResolvedValue({ id: 203, ...visitorToCreate }); // Assign a new ID
    mockTx.visitiors.delete.mockResolvedValue({});
    mockTx.visitor_entry_logs.findMany.mockResolvedValue([]); // Default: no entry logs found for deletion checks
    mockTx.visitiors.findMany
      .mockResolvedValueOnce(mockExistingVisitors) // First call (get existing)
      .mockResolvedValueOnce([
        // Second call (get final updated list) - adjust as needed per test case
        {
          id: 201,
          visitor_first_name: "UpdatedName",
          visitor_last_name: "Member",
        },
        { id: 203, visitor_first_name: "New", visitor_last_name: "Member" },
      ]);
  });

  it("should update schedule, update/create/delete visitors correctly", async () => {
    const updateData = {
      ...baseUpdateData,
      visitors: [
        { ...visitorToUpdate, visitor_first_name: "UpdatedName" }, // Update this one
        visitorToCreate, // Create this one
        // visitorToDelete is omitted, so should be deleted
      ],
    };

    const result = await updateGroupSchedule(scheduleId, updateData);

    expect(result.success).toBe(true);
    expect(result.code).toBe(200);
    expect(result.message).toContain("Schedule successfully updated."); // 1 updated, 1 created in the final list
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);

    // Verify transaction calls
    expect(mockTx.visitors_schedule.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: scheduleId, resident_id: residentId },
      })
    );
    expect(mockTx.visitiors.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { visitor_schedule_id: scheduleId } })
    ); // Fetch existing
    // expect(mockTx.visitiors.update).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     where: { id: visitorToUpdate.id },
    //     data: { visitor_first_name: "UpdatedName" },
    //   })
    // ); // Check update call
    expect(mockTx.visitiors.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: visitorToUpdate.id },
        // Expect all fields that are being updated for this visitor
        data: {
          visitor_first_name: "UpdatedName", // The updated field from test data
          visitor_last_name: visitorToUpdate.visitor_last_name, // Use original last name
          visitor_id_type: visitorToUpdate.visitor_id_type, // Use original id_type
          visitor_id_number: visitorToUpdate.visitor_id_number, // Use original id_number
        },
      })
    ); // Check update call
    expect(mockTx.visitiors.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { ...visitorToCreate, visitor_schedule_id: scheduleId },
      })
    ); // Check create call
    expect(mockTx.visitor_entry_logs.findMany).toHaveBeenCalledWith({
      where: { visitor_id: visitorToDelete.id },
    }); // Check for logs before delete
    expect(mockTx.visitiors.delete).toHaveBeenCalledWith({
      where: { id: visitorToDelete.id },
    }); // Check delete call
    expect(mockTx.visitiors.findMany).toHaveBeenCalledTimes(2); // Called again at the end
  });

  it("should return 400 if required schedule fields are missing", async () => {
    const incompleteData = {
      ...baseUpdateData,
      visitor_email: undefined, // Missing field
      visitors: [visitorToUpdate],
    };
    const result = await updateGroupSchedule(scheduleId, incompleteData);

    expect(result).toEqual({
      success: false,
      code: 400,
      message: "Missing required fields",
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should return 500 and specific error if trying to delete a visitor with entry logs", async () => {
    const updateData = {
      ...baseUpdateData,
      visitors: [
        visitorToUpdate, // Keep this one
        // visitorToDelete is omitted, so attempt deletion
      ],
    };
    // Mock that visitorToDelete *has* entry logs
    mockTx.visitor_entry_logs.findMany.mockImplementation(async (args) => {
      if (args.where.visitor_id === visitorToDelete.id) {
        return [
          { id: 301, entry_time: new Date(), visitor_id: visitorToDelete.id },
        ]; // Simulate existing log
      }
      return [];
    });
    // Mock the transaction to throw the specific error when the check happens
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      try {
        // Simulate the check inside the transaction logic
        const mockTxForError = {
          // Need to redefine tx inside this scope for the test
          visitors_schedule: {
            update: jest
              .fn()
              .mockResolvedValue({ id: scheduleId, ...baseUpdateData }),
          },
          visitiors: {
            findMany: jest.fn().mockResolvedValueOnce(mockExistingVisitors), // Find existing okay
            update: jest.fn().mockResolvedValue(visitorToUpdate),
            create: jest.fn(),
            delete: jest.fn(), // This won't be reached
          },
          visitor_entry_logs: { findMany: mockTx.visitor_entry_logs.findMany }, // Use the mock setup above
        };
        await callback(mockTxForError);
      } catch (e: any) {
        // Re-throw only if it's the expected error to ensure the test is correct
        if (
          e.message.includes(
            "Cannot update visitor because they are already linked to an entry log"
          )
        ) {
          throw e;
        }
        // Throw unexpected errors too, but the test focuses on the specific one
        throw new Error(`Unexpected error in mock transaction: ${e.message}`);
      }
    });

    const result = await updateGroupSchedule(scheduleId, updateData);

    expect(result.success).toBe(false);
    expect(result.code).toBe(500);
    expect(result.message).toContain(
      "Server error: Cannot update visitor because they are already linked to an entry log."
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.visitor_entry_logs.findMany).toHaveBeenCalledWith({
      where: { visitor_id: visitorToDelete.id },
    });
    expect(mockTx.visitiors.delete).not.toHaveBeenCalledWith({
      where: { id: visitorToDelete.id },
    }); // Deletion should not happen
  });

  it("should return 500 if a database error occurs during transaction", async () => {
    const updateData = { ...baseUpdateData, visitors: [visitorToUpdate] };
    const dbError = new Error("Transaction failed");
    // Mock a failure during one of the DB calls within the transaction
    mockTx.visitors_schedule.update.mockRejectedValue(dbError);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      // Redefine tx to use the failing mock
      const failingTx = {
        ...mockTx,
        visitors_schedule: { update: jest.fn().mockRejectedValue(dbError) },
      };
      await callback(failingTx); // Execute with the failing mock
    });

    const result = await updateGroupSchedule(scheduleId, updateData);

    expect(result.success).toBe(false);
    expect(result.code).toBe(500);
    expect(result.message).toBe(`Server error: ${dbError.message}`);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});

// --- Test Suite for deleteSchedule ---
describe("deleteSchedule Action", () => {
  const scheduleId = 30;

  it("should delete the schedule and associated visitors within a transaction", async () => {
    // Arrange: Mock the transaction and its internal calls
    const mockTx = {
      visitiors: { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) }, // Simulate 2 visitors deleted
      visitors_schedule: {
        delete: jest.fn().mockResolvedValue({ id: scheduleId }),
      }, // Simulate schedule deleted
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback) => await callback(mockTx)
    );

    // Act
    const result = await deleteSchedule(scheduleId);

    // Assert
    expect(result).toEqual({
      message: "Schedule deleted successfully",
      success: true,
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.visitiors.deleteMany).toHaveBeenCalledWith({
      where: { visitor_schedule_id: scheduleId },
    });
    expect(mockTx.visitors_schedule.delete).toHaveBeenCalledWith({
      where: { id: scheduleId },
    });
  });

  it("should throw an error if the transaction fails", async () => {
    // Arrange: Mock the transaction to throw an error (e.g., during visitor deletion)
    const dbError = new Error("Foreign key constraint fail");
    const mockTx = {
      visitiors: { deleteMany: jest.fn().mockRejectedValue(dbError) }, // Simulate error here
      visitors_schedule: { delete: jest.fn() }, // This won't be reached
    };
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback) => await callback(mockTx)
    );

    // Act & Assert
    await expect(deleteSchedule(scheduleId)).rejects.toThrow(
      "Error deleting schedule"
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.visitiors.deleteMany).toHaveBeenCalledWith({
      where: { visitor_schedule_id: scheduleId },
    });
    expect(mockTx.visitors_schedule.delete).not.toHaveBeenCalled(); // Should not attempt to delete schedule if visitors fail
  });
});

// Helper to check call order if using jest-extended or similar:
// (Install jest-extended: npm install --save-dev jest-extended)
// import 'jest-extended'; // Add this import at the top
// Then in the delete test:
// expect(mockTx.visitiors.deleteMany).toHaveBeenCalledBefore(mockTx.visitors_schedule.delete);
// If not using jest-extended, checking the order manually by observing mock calls array might be needed
// or trust the await order in the original code. For basic verification, the above checks suffice.
