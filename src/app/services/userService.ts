import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/app/utils/hashPassword"; // Adjust path if necessary

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

export async function getUsers(id: number) {
  return prisma.users.findUnique({ where: { id: Number(id) } });
}

export async function updateUser(id: number, data: any) {
  const currentUser = await getUsers(id);
  if (!currentUser) throw new Error("User not found");

  let { password, role } = data;
  let hashedPassword = currentUser.password;

  if (password && password !== currentUser.password) {
    hashedPassword = await hashPassword(password);
  }

  if (!data.username || !data.role || !data.status) {
    throw new Error("Username, role, and status are required.");
  }

  if (currentUser.role !== role) {
    await prisma.resident.deleteMany({ where: { user_id: Number(id) } });
    await prisma.security.deleteMany({ where: { user_id: Number(id) } });
  }

  const updatedUser = await prisma.users.update({
    where: { id: Number(id) },
    data: {
      username: data.username,
      password: hashedPassword,
      role,
      status: data.status,
    },
  });

  if (role === "resident") {
    await prisma.resident.upsert({
      where: { user_id: Number(id) },
      update: {
        resident_email: data.resident_email,
        resident_first_name: data.resident_first_name,
        resident_last_name: data.resident_last_name,
        resident_house_number: data.resident_house_number,
        resident_address: data.resident_address,
        resident_phone_number: data.resident_phone_number,
      },
      create: {
        resident_email: data.resident_email,
        resident_first_name: data.resident_first_name,
        resident_last_name: data.resident_last_name,
        resident_house_number: data.resident_house_number,
        resident_address: data.resident_address,
        resident_phone_number: data.resident_phone_number,
        user_id: Number(id),
        resident_qr_code: "",
      },
    });
  } else if (role === "security") {
    await prisma.security.upsert({
      where: { user_id: Number(id) },
      update: {
        security_email: data.security_email,
        security_phone_number: data.security_phone_number,
        security_address: data.security_address,
        security_shift: data.security_shift,
        security_access_point: data.security_access_point,
      },
      create: {
        security_first_name: data.security_first_name,
        security_last_name: data.security_last_name,
        security_qr_code: "",
        security_email: data.security_email,
        security_phone_number: data.security_phone_number,
        security_address: data.security_address,
        security_shift: data.security_shift,
        security_access_point: data.security_access_point,
        user_id: Number(id),
      },
    });
  }

  return updatedUser;
}

export async function deleteUser(id: number) {
  await prisma.users.delete({ where: { id: Number(id) } });
  return { message: "User deleted successfully" };
}
