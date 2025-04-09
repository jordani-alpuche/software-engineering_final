// __tests__/actions/visitorActions.test.ts

import {
  createGroupVisitor,
  createIndividualVisitor,
} from "@/app/api/visitors/create/route"; // Adjust the import path
import { prisma } from "@/lib/prisma"; // Import the actual prisma instance path

// --- Mock Prisma Client ---
// We mock the specific methods used by the server actions.
jest.mock("@/lib/prisma", () => ({
  prisma: {
    // Mock the top-level methods
    blacklist_visitors: {
      findFirst: jest.fn(),
      findMany: jest.fn(), // Mock even if only used inside transaction for completeness
    },
    visitors_schedule: {
      create: jest.fn(),
      update: jest.fn(),
    },
    visitiors: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    // Mock the $transaction method
    $transaction: jest.fn().mockImplementation(async (callback) => {
      // The transaction mock executes the callback immediately,
      // passing a mocked transaction client ('tx')
      const mockTx = {
        blacklist_visitors: {
          findFirst: jest.fn(), // Mock methods available inside transaction
          findMany: jest.fn(),
        },
        visitors_schedule: {
          create: jest.fn(),
          update: jest.fn(),
        },
        visitiors: {
          create: jest.fn(),
          createMany: jest.fn(),
        },
      };
      // You might need to configure return values for mockTx methods here
      // if the transaction logic depends on specific return values mid-transaction
      // For these specific tests, we mostly care about the final outcome
      // and the input to the main create/createMany calls.

      // Simulate the successful creation within the transaction mock if needed
      // For example, mock schedule creation to return an ID
      mockTx.visitors_schedule.create.mockResolvedValue({
        id: 999 /* other fields */,
      });
      mockTx.visitiors.create.mockResolvedValue({
        id: 1000 /* other fields */,
      });
      mockTx.visitiors.createMany.mockResolvedValue({ count: 2 }); // Example return for createMany
      mockTx.visitors_schedule.update.mockResolvedValue({
        id: 999 /* updated fields */,
      });
      mockTx.blacklist_visitors.findMany.mockResolvedValue([]); // Assume no blacklist found inside tx

      return await callback(mockTx); // Execute the actual transaction logic with the mock client
    }),
  },
}));

// --- Helper to reset mocks before each test ---
beforeEach(() => {
  // Reset all mock function calls and implementations
  jest.clearAllMocks();
});

// --- Test Suite for createGroupVisitor ---
describe("createGroupVisitor Server Action", () => {
  // Test Case 1: Successful group visitor creation (200 OK)
  it("should successfully create a group visitor schedule and return 200", async () => {
    // Arrange: Setup mock data and Prisma responses
    const mockGroupData = {
      resident_id: 1,
      visitors: [
        {
          visitor_first_name: "John",
          visitor_last_name: "Doe",
          visitor_id_type: "ID",
          visitor_id_number: "JD123",
        },
        {
          visitor_first_name: "Jane",
          visitor_last_name: "Smith",
          visitor_id_type: "Passport",
          visitor_id_number: "JS456",
        },
      ],
      visitor_phone: "1234567890",
      visitor_email: "group@example.com",
      status: "Scheduled",
      visitor_type: "Family",
      visitor_entry_date: new Date().toISOString(),
      visitor_exit_date: new Date(Date.now() + 86400000).toISOString(), // +1 day
      license_plate: "GRP-123",
      comments: "Test group visit",
      sg_type: 1,
    };

    // Mock Prisma responses for this successful case
    (prisma.blacklist_visitors.findFirst as jest.Mock).mockResolvedValue(null); // No visitor is blacklisted
    // The $transaction mock is set up globally to simulate success by default

    // Act: Call the server action
    const result = await createGroupVisitor(mockGroupData);

    // Assert: Check the response and mock calls
    expect(result.success).toBe(true);
    expect(result.code).toBe(200);
    expect(result.message).toBe("Group visitors scheduled successfully");
    expect(result.visitorScheduleId).toBeDefined(); // Check if an ID was returned (e.g., 999 from mock)

    // Verify Prisma calls
    expect(prisma.blacklist_visitors.findFirst).toHaveBeenCalledTimes(
      mockGroupData.visitors.length
    ); // Checked each visitor
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);

    // You could add more specific checks on what the transaction mock was called with if needed
    // e.g., expect(mockTx.visitors_schedule.create).toHaveBeenCalledWith(...) inside the mock implementation check
  });

  // Test Case 2: Missing required data (400 Bad Request)
  it("should return a 400 error if required data is missing", async () => {
    // Arrange: Setup mock data with a missing field (e.g., visitor_phone)
    const mockIncompleteGroupData = {
      resident_id: 1,
      visitors: [
        {
          visitor_first_name: "John",
          visitor_last_name: "Doe",
          visitor_id_type: "ID",
          visitor_id_number: "JD123",
        },
      ],
      // visitor_phone: '1234567890', // Missing
      visitor_email: "group@example.com",
      status: "Scheduled",
      visitor_type: "Family",
      visitor_entry_date: new Date().toISOString(),
      visitor_exit_date: new Date(Date.now() + 86400000).toISOString(),
      license_plate: "GRP-123",
      comments: "Test group visit",
      sg_type: 1,
    } as any; // Use 'as any' to bypass TypeScript check for the missing field during test setup

    // Act: Call the server action
    const result = await createGroupVisitor(mockIncompleteGroupData);

    // Assert: Check the response
    expect(result.success).toBe(false);
    expect(result.code).toBe(400);
    expect(result.message).toContain("Missing required fields"); // Check for the specific error message

    // Verify Prisma was NOT called because validation failed early
    expect(prisma.blacklist_visitors.findFirst).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  // Add more tests for other scenarios if needed (e.g., blacklisted visitor - 403, invalid visitor data in array - 400)
  it("should return a 403 error if a visitor in the group is blacklisted", async () => {
    // Arrange: Setup mock data
    const mockGroupDataWithBlacklist = {
      resident_id: 1,
      visitors: [
        {
          visitor_first_name: "John",
          visitor_last_name: "Doe",
          visitor_id_type: "ID",
          visitor_id_number: "JD123",
        },
        {
          visitor_first_name: "Bad",
          visitor_last_name: "Actor",
          visitor_id_type: "Passport",
          visitor_id_number: "BAD456",
        }, // This one is blacklisted
      ],
      visitor_phone: "1234567890",
      visitor_email: "group@example.com",
      status: "Scheduled",
      visitor_type: "Family",
      visitor_entry_date: new Date().toISOString(),
      visitor_exit_date: new Date(Date.now() + 86400000).toISOString(),
      license_plate: "GRP-123",
      sg_type: 1,
    };

    // Mock Prisma: first check passes (John Doe), second check finds a blacklist entry
    (prisma.blacklist_visitors.findFirst as jest.Mock)
      .mockResolvedValueOnce(null) // First visitor is OK
      .mockResolvedValueOnce({ id: 5, reason: "Troublemaker" }); // Second visitor is blacklisted

    // Act
    const result = await createGroupVisitor(mockGroupDataWithBlacklist);

    // Assert
    expect(result.success).toBe(false);
    expect(result.code).toBe(403);
    expect(result.message).toContain("Visitor Bad Actor is blacklisted");
    expect(prisma.blacklist_visitors.findFirst).toHaveBeenCalledTimes(2); // Checked both visitors
    expect(prisma.$transaction).not.toHaveBeenCalled(); // Transaction should not start
  });
});

// --- Test Suite for createIndividualVisitor ---
describe("createIndividualVisitor Server Action", () => {
  // Test Case 1: Successful individual visitor creation (200 OK)
  it("should successfully create an individual visitor schedule and return 200", async () => {
    // Arrange: Setup mock data and Prisma responses
    const mockIndividualData = {
      resident_id: 2,
      visitor_first_name: "Alice",
      visitor_last_name: "Wonder",
      visitor_phone: "9876543210",
      visitor_id_type: "Driver License",
      visitor_id_number: "AW789",
      visitor_email: "alice@example.com",
      status: "Approved",
      visitor_type: "Friend",
      visitor_entry_date: new Date().toISOString(),
      visitor_exit_date: new Date(Date.now() + 3600000).toISOString(), // +1 hour
      license_plate: "IND-456",
      sg_type: 2,
    };

    // Mock Prisma responses for this successful case
    (prisma.blacklist_visitors.findFirst as jest.Mock).mockResolvedValue(null); // Visitor is not blacklisted
    // The $transaction mock is set up globally to simulate success

    // Act: Call the server action
    const result = await createIndividualVisitor(mockIndividualData);

    // Assert: Check the response and mock calls
    expect(result.success).toBe(true);
    expect(result.code).toBe(200);
    expect(result.message).toBe("Visitor created successfully");
    expect(result.visitorScheduleId).toBeDefined(); // Check if an ID was returned (e.g., 999 from mock)

    // Verify Prisma calls
    expect(prisma.blacklist_visitors.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  // Test Case 2: Missing required data (400 Bad Request)
  it("should return a 400 error if required data is missing", async () => {
    // Arrange: Setup mock data with a missing field (e.g., visitor_email)
    const mockIncompleteIndividualData = {
      resident_id: 2,
      visitor_first_name: "Alice",
      visitor_last_name: "Wonder",
      visitor_phone: "9876543210",
      visitor_id_type: "Driver License",
      visitor_id_number: "AW789",
      // visitor_email: 'alice@example.com', // Missing
      status: "Approved",
      visitor_type: "Friend",
      visitor_entry_date: new Date().toISOString(),
      visitor_exit_date: new Date(Date.now() + 3600000).toISOString(),
      license_plate: "IND-456",
      sg_type: 2,
    } as any; // Use 'as any' to bypass TypeScript check

    // Act: Call the server action
    const result = await createIndividualVisitor(mockIncompleteIndividualData);

    // Assert: Check the response
    expect(result.success).toBe(false);
    expect(result.code).toBe(400);
    expect(result.message).toBe("Missing required fields");

    // Verify Prisma was NOT called
    expect(prisma.blacklist_visitors.findFirst).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  // Add more tests if needed (e.g., blacklisted visitor - 403)
  it("should return a 403 error if the individual visitor is blacklisted", async () => {
    // Arrange
    const mockIndividualDataBlacklisted = {
      resident_id: 2,
      visitor_first_name: "Bad",
      visitor_last_name: "Guy",
      visitor_phone: "111222333",
      visitor_id_type: "ID",
      visitor_id_number: "BAD111",
      visitor_email: "bad@example.com",
      status: "Pending",
      visitor_type: "Contractor",
      visitor_entry_date: new Date().toISOString(),
      visitor_exit_date: new Date(Date.now() + 3600000).toISOString(),
      license_plate: "BAD-000",
      sg_type: 1,
    };

    // Mock Prisma: findFirst returns a blacklist entry
    (prisma.blacklist_visitors.findFirst as jest.Mock).mockResolvedValue({
      id: 6,
      reason: "Not allowed",
    });

    // Act
    const result = await createIndividualVisitor(mockIndividualDataBlacklisted);

    // Assert
    expect(result.success).toBe(false);
    expect(result.code).toBe(403);
    expect(result.message).toBe("Visitor is blacklisted");
    expect(prisma.blacklist_visitors.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.$transaction).not.toHaveBeenCalled(); // Transaction should not start
  });
});
