import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./hashPassword";

const prisma = new PrismaClient();

export async function createUser() {
  const hashedPassword = await hashPassword("123kelsey"); // Hashing the password before saving

  try {
    const user = await prisma.users.create({
      data: {
        username: "kelseyA", // Username for the new admin
        password: hashedPassword, // Hashed password
        role: "admin", // Admin role
        status: "active", // Set status to active
      },
    });

    console.log("User created:", user);
    return user; // Return the created user object
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Call the function to create the user
createUser()
  .then(() => {
    console.log("Admin user created successfully!");
  })
  .catch((error) => {
    console.error("Error creating admin user:", error);
  });
