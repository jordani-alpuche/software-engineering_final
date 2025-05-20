import {
  createGroupVisitor,
  createIndividualVisitor,
} from "@/lib/serverActions/visitors/create/CreateVisitorActions";
import { prisma } from "@/lib/prisma";

// --- Mock NextAuth getServerSession ---
jest.mock("next-auth/next", () => ({
  __esModule: true,
  getServerSession: jest.fn().mockResolvedValue({ user: { id: "1", role: "admin", username: "testuser" } }),
  default: jest.fn(),
}));
import { getServerSession } from "next-auth/next";

// --- Mock Prisma Client ---
// Add both 'visitiors' and 'visitors' to avoid undefined errors in any implementation
jest.mock("@/lib/prisma", () => ({
  prisma: {
    blacklist_visitors: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    visitors_schedule: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    visitiors: { // <-- keep as 'visitiors'
      create: jest.fn(),
      createMany: jest.fn(),
    },
    visitors: { // <-- add this to cover any code using the correct spelling
      create: jest.fn(),
      createMany: jest.fn(),
    },
    notifications: { // <-- add notifications mock
      create: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      const mockTx = {
        blacklist_visitors: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        visitors_schedule: {
          create: jest.fn(),
          update: jest.fn(),
          findFirst: jest.fn(),
        },
        visitiors: {
          create: jest.fn(),
          createMany: jest.fn(),
        },
        visitors: {
          create: jest.fn(),
          createMany: jest.fn(),
        },
        notifications: {
          create: jest.fn(),
        },
      };
      mockTx.visitors_schedule.create.mockResolvedValue({ id: 999 });
      mockTx.visitors_schedule.update.mockResolvedValue({ id: 999 });
      mockTx.visitors_schedule.findFirst.mockResolvedValue({ id: 999, visitor_qrcode: "some_qr" });
      mockTx.visitiors.create.mockResolvedValue({ id: 1000 });
      mockTx.visitiors.createMany.mockResolvedValue({ count: 2 });
      mockTx.visitors.create.mockResolvedValue({ id: 1000 });
      mockTx.visitors.createMany.mockResolvedValue({ count: 2 });
      mockTx.blacklist_visitors.findMany.mockResolvedValue([]);
      mockTx.notifications.create.mockResolvedValue({ id: 1 });
      return await callback(mockTx);
    }),
  },
}));

// --- Mock sendEmail so it doesn't actually send emails during tests ---
jest.mock("@/app/utils/sendEmail", () => ({
  sendEmail: jest.fn().mockResolvedValue({ status: 200 }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "1", role: "admin", username: "testuser" } });
});

describe("createGroupVisitor Server Action", () => {
  it("should successfully create a group visitor schedule and return 200", async () => {
    const mockGroupData = {
      resident_id: 1,
      visitors: [
        {
          visitor_first_name: "John",
          visitor_last_name: "Doe",
          visitor_id_type: "ss",
          visitor_id_number: "JD123",
        },
        {
          visitor_first_name: "Jane",
          visitor_last_name: "Smith",
          visitor_id_type: "passport",
          visitor_id_number: "JS456",
        },
      ],
      visitor_phone: "1234567890",
      visitor_email: "group@example.com",
      status: "active",
      visitor_type: "recurring",
      visitor_entry_date: new Date().toISOString(),
      visitor_exit_date: new Date(Date.now() + 86400000).toISOString(),
      license_plate: "GRP-123",
      comments: "Test group visit",
      sg_type: 1,
    };

    (prisma.blacklist_visitors.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await createGroupVisitor(mockGroupData);

    expect(result.success).toBe(true);
    expect(result.code).toBe(200);
    expect(result.message).toBe("Group visitors scheduled successfully");
    expect(result.visitorScheduleId).toBeDefined();
    expect(prisma.blacklist_visitors.findFirst).toHaveBeenCalledTimes(
      mockGroupData.visitors.length
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("should return a 400 error if required data is missing", async () => {
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
      visitor_type: "recurring",
      visitor_entry_date: new Date().toISOString(),
      visitor_exit_date: new Date(Date.now() + 86400000).toISOString(),
      license_plate: "GRP-123",
      comments: "Test group visit",
      sg_type: 1,
    } as any;

    const result = await createGroupVisitor(mockIncompleteGroupData);

    expect(result.success).toBe(false);
    expect(result.code).toBe(400);
    expect(result.message).toContain("Missing required fields");
    expect(prisma.blacklist_visitors.findFirst).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should return a 403 error if a visitor in the group is blacklisted", async () => {
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
        },
      ],
      visitor_phone: "1234567890",
      visitor_email: "group@example.com",
      status: "Scheduled",
      visitor_type: "recurring",
      visitor_entry_date: new Date().toISOString(),
      visitor_exit_date: new Date(Date.now() + 86400000).toISOString(),
      license_plate: "GRP-123",
      sg_type: 1,
    };

    (prisma.blacklist_visitors.findFirst as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 5, reason: "Troublemaker" });

    const result = await createGroupVisitor(mockGroupDataWithBlacklist);

    expect(result.success).toBe(false);
    expect(result.code).toBe(403);
    expect(result.message).toContain("Visitor Bad Actor is blacklisted");
    expect(prisma.blacklist_visitors.findFirst).toHaveBeenCalledTimes(2);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe("createIndividualVisitor Server Action", () => {
  it("should successfully create an individual visitor schedule and return 200", async () => {
    const mockIndividualData = {
      resident_id: 2,
      visitor_first_name: "Alice",
      visitor_last_name: "Wonder",
      visitor_phone: "9876543210",
      visitor_id_type: "Driver License",
      visitor_id_number: "AW789",
      visitor_email: "alice@example.com",
      status: "active",
      visitor_type: "one-time",
      visitor_entry_date: new Date().toISOString(),
      visitor_exit_date: new Date(Date.now() + 3600000).toISOString(),
      license_plate: "IND-456",
      sg_type: 2,
    };

    (prisma.blacklist_visitors.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await createIndividualVisitor(mockIndividualData);

    expect(result.success).toBe(true);
    expect(result.code).toBe(200);
    expect(result.message).toBe("Visitor created successfully");
    expect(result.visitorScheduleId).toBeDefined();
    expect(prisma.blacklist_visitors.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("should return a 400 error if required data is missing", async () => {
    const mockIncompleteIndividualData = {
      resident_id: 2,
      visitor_first_name: "Alice",
      visitor_last_name: "Wonder",
      visitor_phone: "9876543210",
      visitor_id_type: "Driver License",
      visitor_id_number: "AW789",
      // visitor_email: 'alice@example.com', // Missing
      status: "active",
      visitor_type: "one-time",
      visitor_entry_date: new Date().toISOString(),
      visitor_exit_date: new Date(Date.now() + 3600000).toISOString(),
      license_plate: "IND-456",
      sg_type: 2,
    } as any;

    const result = await createIndividualVisitor(mockIncompleteIndividualData);

    expect(result.success).toBe(false);
    expect(result.code).toBe(400);
    expect(result.message).toBe("Missing required fields");
    expect(prisma.blacklist_visitors.findFirst).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should return a 403 error if the individual visitor is blacklisted", async () => {
    const mockIndividualDataBlacklisted = {
      resident_id: 2,
      visitor_first_name: "Bad",
      visitor_last_name: "Guy",
      visitor_phone: "111222333",
      visitor_id_type: "ID",
      visitor_id_number: "BAD111",
      visitor_email: "bad@example.com",
      status: "Pending",
      visitor_type: "one-time",
      visitor_entry_date: new Date().toISOString(),
      visitor_exit_date: new Date(Date.now() + 3600000).toISOString(),
      license_plate: "BAD-000",
      sg_type: 1,
    };

    (prisma.blacklist_visitors.findFirst as jest.Mock).mockResolvedValue({
      id: 6,
      reason: "Not allowed",
    });

    const result = await createIndividualVisitor(mockIndividualDataBlacklisted);

    expect(result.success).toBe(false);
    expect(result.code).toBe(403);
    expect(result.message).toBe("Visitor is blacklisted");
    expect(prisma.blacklist_visitors.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});