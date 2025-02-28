import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./hashPassword";

const prisma = new PrismaClient();

export async function createUser(
  name: string,
  username: string,
  password: string,
  phone: string,
  role: string,
  unit_number: string
) {
  const hashedPassword = await hashPassword(password); // Hashing the password before saving

  try {
    const user = await prisma.users.create({
      data: {
        name,
        username,
        password: hashedPassword,
        phone,
        role,
        unit_number,
      },
    });

    console.log("User created:", user);
    return user; // Return the created user object
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}
