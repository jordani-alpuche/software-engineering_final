import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { use } from "react";

const prisma = new PrismaClient();

export async function usersInfo() {
  // Fetch all users
  try {
    const users = await prisma.users.findMany();
    return users;
  } catch (error) {
    return error;
  }
}
