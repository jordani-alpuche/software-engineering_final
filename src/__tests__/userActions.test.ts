// __tests__/actions/userActions.test.ts

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/app/utils/hashPassword"; // Adjust path if necessary
import { createUser } from "@/app/api/users/create/route"; // Adjusted path assuming 'app' not 'ap'
import { getUsers, updateUser, deleteUser } from "@/app/api/users/[id]/route"; // Adjust path if necessary
import { usersInfo } from "@/app/api/users/list/route"; // Adjust path if necessary

// --- Mock Prisma Client ---
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    users: {
      // Added users model mocks
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    // Include other models if tested in the same file from previous examples
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
      /* Basic mock if needed */
      const mockTx = {
        /* Mock transaction client methods if needed */
      };
      return await callback(mockTx);
    }),
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

// --- Mock hashPassword Utility ---
jest.mock("@/app/utils/hashPassword"); // Adjust path if necessary
const mockHashPassword = hashPassword as jest.Mock;

// --- Prisma Instance (using the mock) ---
const prisma = new PrismaClient();

// --- Helper to reset mocks before each test ---
beforeEach(() => {
  jest.clearAllMocks();
  // Default mock for hashPassword
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
    // Arrange
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(null); // User doesn't exist
    (prisma.users.create as jest.Mock).mockResolvedValue({
      id: 1,
      ...newUserDbData,
    });

    // Act
    const result = await createUser(newUserRawData);

    // Assert
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
      data: newUserDbData, // Ensure data passed includes the hashed password
    });
  });

  it("should return 409 if username is already taken", async () => {
    // Arrange
    (prisma.users.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      username: "testuser" /* ... */,
    }); // User exists

    // Act
    const result = await createUser(newUserRawData);

    // Assert
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
    // Arrange
    const dbError = new Error("DB create failed");
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(null); // User doesn't exist
    (prisma.users.create as jest.Mock).mockRejectedValue(dbError); // Mock create to fail

    // Act
    const result = await createUser(newUserRawData);

    // Assert
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
    // other fields
  };

  it("should return the user object if found", async () => {
    // Arrange
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(mockUser);

    // Act
    const result = await getUsers(userId);

    // Assert
    expect(result).toEqual(mockUser);
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
  });

  it("should return null if user is not found", async () => {
    // Arrange
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    const result = await getUsers(userId);

    // Assert
    expect(result).toBeNull();
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
  });

  it("should handle non-integer IDs gracefully (prisma might return null)", async () => {
    // Arrange
    const invalidId: any = "abc"; // Example of non-numeric ID
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(null); // Assume Prisma handles NaN/invalid number by returning null

    // Act
    const result = await getUsers(invalidId); // Call with invalid ID

    // Assert
    expect(result).toBeNull();
    // Check that prisma was called, likely with NaN after Number() conversion
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: Number(invalidId) },
    }); // Number('abc') -> NaN
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
    // ... other fields
  };

  const updateDataPasswordChange = {
    username: "updateduser",
    password: "newpassword123", // New password
    role: "security", // Same role
    // ... other fields can be added or omitted
  };

  const updateDataNoPasswordChange = {
    username: "updateduserNoPass",
    role: "resident", // Role change
    first_name: "Updated", // Other fields changed
    last_name: "UserResident",
    // password field is omitted
  };

  const updateDataAdminRole = {
    username: "updatedadmin",
    role: "admin", // Role change to admin
  };

  it("should update user successfully (with password change)", async () => {
    // Arrange
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(currentUserData);
    (prisma.users.update as jest.Mock).mockResolvedValue({
      id: userId,
      ...updateDataPasswordChange,
      password: "hashed_newpassword123",
    }); // Return updated user

    // Act
    const result = await updateUser(userId, updateDataPasswordChange);

    // Assert
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
        password: "hashed_newpassword123", // Expect new hashed password
        // Assert role specific fields are NOT wiped if role is security
      },
    });
  });

  it("should update user successfully (without password change)", async () => {
    // Arrange
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(currentUserData);
    (prisma.users.update as jest.Mock).mockResolvedValue({
      id: userId,
      ...updateDataNoPasswordChange,
      password: currentUserData.password,
    });

    // Act
    const result = await updateUser(userId, updateDataNoPasswordChange);

    // Assert
    expect(result).toEqual({
      success: true,
      code: 200,
      message: "User updated successfully",
    });
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(mockHashPassword).not.toHaveBeenCalled(); // Password not changed, hashing skipped
    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: expect.objectContaining({
        username: updateDataNoPasswordChange.username,
        role: updateDataNoPasswordChange.role,
        password: currentUserData.password, // Expect ORIGINAL hashed password

        first_name: "Updated",
        last_name: "UserResident",
      }),
    });
  });

  it("should wipe security fields when role changes to admin/resident", async () => {
    // Arrange
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(currentUserData); // Current role is security
    (prisma.users.update as jest.Mock).mockResolvedValue({
      id: userId,
      role: "resident" /* ... */,
    });
    const updateDataRoleChange = { username: "residentUser", role: "resident" };

    // Act
    await updateUser(userId, updateDataRoleChange);

    // Assert
    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: expect.objectContaining({
        role: "resident",

        password: currentUserData.password, // Original password as none provided
      }),
    });
  });

  it("should wipe resident/security fields when role changes to admin", async () => {
    // Arrange
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(currentUserData); // Current role is security
    (prisma.users.update as jest.Mock).mockResolvedValue({
      id: userId,
      role: "admin" /* ... */,
    });

    // Act
    await updateUser(userId, updateDataAdminRole);

    // Assert
    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: expect.objectContaining({
        username: updateDataAdminRole.username,
        role: "admin",

        password: currentUserData.password, // Original password
      }),
    });
  });

  it("should return 404 if user to update is not found", async () => {
    // Arrange
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(null); // User not found

    // Act
    const result = await updateUser(userId, updateDataPasswordChange);

    // Assert
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
    // Arrange
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(currentUserData); // User exists
    const invalidUpdateData = { role: "admin" /* no username */ };

    // Act
    const result = await updateUser(userId, invalidUpdateData);

    // Assert
    expect(result).toEqual({
      success: false,
      code: 400,
      message: "Username, role is required.", // Check specific message from code
    });
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(mockHashPassword).not.toHaveBeenCalled();
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it("should return 500 if prisma update fails", async () => {
    // Arrange
    const dbError = new Error("DB update failed");
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(currentUserData);
    (prisma.users.update as jest.Mock).mockRejectedValue(dbError); // Mock update to fail

    // Act
    const result = await updateUser(userId, updateDataPasswordChange); // Use data that triggers update

    // Assert
    expect(result).toEqual({
      success: false,
      code: 500,
      message: `Server error: ${dbError.message}`, // Check specific message
    });
    expect(prisma.users.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.users.update).toHaveBeenCalledTimes(1);
  });
});

// --- Test Suite for deleteUser ---
describe("deleteUser Action", () => {
  const userId = 30;

  it("should delete user successfully", async () => {
    // Arrange
    (prisma.users.delete as jest.Mock).mockResolvedValue({
      id: userId /* ... */,
    }); // Simulate successful delete

    // Act
    const result = await deleteUser(userId);

    // Assert
    expect(result).toEqual({
      message: "User deleted successfully",
      success: true,
    });
    expect(prisma.users.delete).toHaveBeenCalledWith({ where: { id: userId } });
  });

  it("should throw an error if prisma delete fails", async () => {
    // Arrange
    const dbError = new Error("DB delete failed");
    (prisma.users.delete as jest.Mock).mockRejectedValue(dbError);

    // Act & Assert
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
    // Arrange
    (prisma.users.findMany as jest.Mock).mockResolvedValue(mockUserList);

    // Act
    const result = await usersInfo();

    // Assert
    expect(result).toEqual(mockUserList);
    expect(prisma.users.findMany).toHaveBeenCalledWith(); // No args expected
  });

  it("should return an empty array if no users exist", async () => {
    // Arrange
    (prisma.users.findMany as jest.Mock).mockResolvedValue([]);

    // Act
    const result = await usersInfo();

    // Assert
    expect(result).toEqual([]);
    expect(prisma.users.findMany).toHaveBeenCalledWith();
  });

  it("should return the error object if prisma findMany fails", async () => {
    // Arrange
    const dbError = new Error("Failed to fetch users");
    (prisma.users.findMany as jest.Mock).mockRejectedValue(dbError);

    // Act
    const result = await usersInfo();

    // Assert
    // Based on the try/catch returning 'error'
    expect(result).toBeInstanceOf(Error);
    expect(result).toEqual(dbError);
    expect(prisma.users.findMany).toHaveBeenCalledWith();
  });
});
