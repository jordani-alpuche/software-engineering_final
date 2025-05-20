// __tests__/actions/userActions.test.ts

// --- Mock NextAuth (MUST be first!) ---
jest.mock("next-auth/next", () => ({
  __esModule: true,
  getServerSession: jest.fn(),
  default: jest.fn(),
}));
const mockGetServerSession = require("next-auth/next").getServerSession as jest.Mock;

// --- Mock Prisma Client ---
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
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
    blacklist_visitors: { findUnique: jest.fn(), findMany: jest.fn() },
    visitor_entry_logs: { findMany: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      const mockTx = {};
      return await callback(mockTx);
    }),
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

// --- Mock hashPassword Utility ---
jest.mock("@/app/utils/hashPassword");
import { hashPassword } from "@/app/utils/hashPassword";
const mockHashPassword = hashPassword as jest.Mock;

// --- Now import your server actions ---
import { PrismaClient } from "@prisma/client";
import { createUser } from "@/lib/serverActions/users/create/CreateUserActions";
import { getUsers, updateUser, deleteUser } from "@/lib/serverActions/users/update/UpdateUsersActions";
import { usersInfo } from "@/lib/serverActions/users/list/ListUsersActions";

// --- Prisma Instance (using the mock) ---
const prisma = new PrismaClient();

// --- Helper to reset mocks before each test ---
beforeEach(() => {
  jest.clearAllMocks();
  mockGetServerSession.mockResolvedValue({ user: { id: 1, role: "admin" } }); // Default to admin session
  mockHashPassword.mockImplementation(
    async (password: string) => `hashed_${password}`
  );
});

// --- Test Suite for createUser ---
describe("createUser Action", () => {
  const newUserRawData = {
    username: "testuser",
    password: "password123",
    role: "resident",
    first_name: "Test",
    last_name: "User",
    // Add other required fields based on your schema/logic
  };
  const newUserDbData = {
    ...newUserRawData,
    password: "hashed_password123", // Expect hashed password
  };

  it("should successfully create a new user", async () => {
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.users.create as jest.Mock).mockResolvedValue({
      id: 1,
      ...newUserDbData,
    });

    const result = await createUser(newUserRawData);

    expect(result).toEqual({
      success: true,
      code: 201,
      message: "User created successfully",
    });
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { username: newUserRawData.username },
    });
    expect(mockHashPassword).toHaveBeenCalledWith("password123");
    expect(prisma.users.create).toHaveBeenCalledWith({
      data: newUserDbData,
    });
  });

  it("should return 409 if username is already taken", async () => {
    (prisma.users.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      username: "testuser",
    });

    const result = await createUser(newUserRawData);

    expect(result).toEqual({
      success: false,
      code: 409,
      message: "taken",
    });
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { username: newUserRawData.username },
    });
    expect(mockHashPassword).not.toHaveBeenCalled();
    expect(prisma.users.create).not.toHaveBeenCalled();
  });

  it("should return 500 if prisma create fails", async () => {
    const dbError = new Error("DB create failed");
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.users.create as jest.Mock).mockRejectedValue(dbError);

    const result = await createUser(newUserRawData);

    expect(result).toEqual({
      success: false,
      code: 500,
      message: "Internal Server Error",
    });
    expect(prisma.users.findUnique).toHaveBeenCalledTimes(1);
    expect(mockHashPassword).toHaveBeenCalledTimes(1);
    expect(prisma.users.create).toHaveBeenCalledTimes(1);
  });
});

// --- Test Suite for getUsers (Fetch Single User) ---
describe("getUsers Action", () => {
  const userId = 10;
  const mockUser = {
    id: userId,
    username: "founduser",
    role: "admin",
    password: "some_hashed_password",
  };

  it("should return the user object if found", async () => {
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await getUsers(userId);

    expect(result).toEqual(mockUser);
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
  });

  it("should return null if user is not found", async () => {
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getUsers(userId);

    expect(result).toBeNull();
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
  });

  it("should handle non-integer IDs gracefully (prisma might return null)", async () => {
    const invalidId: any = "abc";
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getUsers(invalidId);

    expect(result).toBeNull();
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: Number(invalidId) },
    });
  });
});

// --- Test Suite for updateUser ---
describe("updateUser Action", () => {
  const userId = 20;
  const currentUserData = {
    id: userId,
    username: "originaluser",
    password: "hashed_originalpassword",
    role: "security",
    first_name: "Original",
    last_name: "User",
    email: "original@test.com",
    phone_number: "123456",
    address: "123 Main St",
    house_number: "A1",
  };

  const updateDataPasswordChange = {
    username: "updateduser",
    password: "newpassword123",
    role: "security",
  };

  const updateDataNoPasswordChange = {
    username: "updateduserNoPass",
    role: "resident",
    first_name: "Updated",
    last_name: "UserResident",
  };

  const updateDataAdminRole = {
    username: "updatedadmin",
    role: "admin",
  };

  it("should update user successfully (with password change)", async () => {
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(currentUserData);
    (prisma.users.update as jest.Mock).mockResolvedValue({
      id: userId,
      ...updateDataPasswordChange,
      password: "hashed_newpassword123",
    });

    const result = await updateUser(userId, updateDataPasswordChange);

    expect(result).toEqual({
      success: true,
      code: 200,
      message: "User updated successfully",
    });
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(mockHashPassword).toHaveBeenCalledWith(
      updateDataPasswordChange.password
    );
    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: {
        ...updateDataPasswordChange,
        password: "hashed_newpassword123",
      },
    });
  });

  it("should update user successfully (without password change)", async () => {
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(currentUserData);
    (prisma.users.update as jest.Mock).mockResolvedValue({
      id: userId,
      ...updateDataNoPasswordChange,
      password: currentUserData.password,
    });

    const result = await updateUser(userId, updateDataNoPasswordChange);

    expect(result).toEqual({
      success: true,
      code: 200,
      message: "User updated successfully",
    });
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(mockHashPassword).not.toHaveBeenCalled();
    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: expect.objectContaining({
        username: updateDataNoPasswordChange.username,
        role: updateDataNoPasswordChange.role,
        password: currentUserData.password,
        first_name: "Updated",
        last_name: "UserResident",
      }),
    });
  });

  it("should wipe security fields when role changes to admin/resident", async () => {
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(currentUserData);
    (prisma.users.update as jest.Mock).mockResolvedValue({
      id: userId,
      role: "resident",
    });
    const updateDataRoleChange = { username: "residentUser", role: "resident" };

    await updateUser(userId, updateDataRoleChange);

    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: expect.objectContaining({
        role: "resident",
        password: currentUserData.password,
      }),
    });
  });

  it("should wipe resident/security fields when role changes to admin", async () => {
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(currentUserData);
    (prisma.users.update as jest.Mock).mockResolvedValue({
      id: userId,
      role: "admin",
    });

    await updateUser(userId, updateDataAdminRole);

    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: expect.objectContaining({
        username: updateDataAdminRole.username,
        role: "admin",
        password: currentUserData.password,
      }),
    });
  });

  it("should return 404 if user to update is not found", async () => {
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await updateUser(userId, updateDataPasswordChange);

    expect(result).toEqual({
      success: false,
      code: 404,
      message: "User not found",
    });
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(mockHashPassword).not.toHaveBeenCalled();
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it("should return 400 if username is missing in update data", async () => {
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(currentUserData);
    const invalidUpdateData = { role: "admin" };

    const result = await updateUser(userId, invalidUpdateData);

    expect(result).toEqual({
      success: false,
      code: 400,
      message: "Username, role is required.",
    });
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(mockHashPassword).not.toHaveBeenCalled();
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it("should return 500 if prisma update fails", async () => {
    const dbError = new Error("DB update failed");
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(currentUserData);
    (prisma.users.update as jest.Mock).mockRejectedValue(dbError);

    const result = await updateUser(userId, updateDataPasswordChange);

    expect(result).toEqual({
      success: false,
      code: 500,
      message: `Server error: ${dbError.message}`,
    });
    expect(prisma.users.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.users.update).toHaveBeenCalledTimes(1);
  });
});

// --- Test Suite for deleteUser ---
describe("deleteUser Action", () => {
  const userId = 30;

  it("should delete user successfully", async () => {
    (prisma.users.delete as jest.Mock).mockResolvedValue({
      id: userId,
    });

    const result = await deleteUser(userId);

    expect(result).toEqual({
      message: "User deleted successfully",
      success: true,
    });
    expect(prisma.users.delete).toHaveBeenCalledWith({ where: { id: userId } });
  });

  it("should throw an error if prisma delete fails", async () => {
    const dbError = new Error("DB delete failed");
    (prisma.users.delete as jest.Mock).mockRejectedValue(dbError);

    await expect(deleteUser(userId)).rejects.toThrow("Error deleting user");
    expect(prisma.users.delete).toHaveBeenCalledWith({ where: { id: userId } });
  });
});

// --- Test Suite for usersInfo (List All Users) ---
describe("usersInfo Action", () => {
  const mockUserList = [
    { id: 1, username: "user1", role: "admin" },
    { id: 2, username: "user2", role: "resident" },
  ];

  it("should return a list of all users", async () => {
    (prisma.users.findMany as jest.Mock).mockResolvedValue(mockUserList);

    const result = await usersInfo();

    expect(result).toEqual(mockUserList);
    expect(prisma.users.findMany).toHaveBeenCalledWith();
  });

  it("should return an empty array if no users exist", async () => {
    (prisma.users.findMany as jest.Mock).mockResolvedValue([]);

    const result = await usersInfo();

    expect(result).toEqual([]);
    expect(prisma.users.findMany).toHaveBeenCalledWith();
  });

  it("should return the error object if prisma findMany fails", async () => {
    const dbError = new Error("Failed to fetch users");
    (prisma.users.findMany as jest.Mock).mockRejectedValue(dbError);

    const result = await usersInfo();

    expect(result).toBeInstanceOf(Error);
    expect(result).toEqual(dbError);
    expect(prisma.users.findMany).toHaveBeenCalledWith();
  });
});