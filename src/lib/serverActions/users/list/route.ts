import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { use } from "react";

const prisma = new PrismaClient();

/*
 ** @description: This function retrieves all users from the database.
 ** @returns: An array of users or an error message.
 ** @throws: Error if the database query fails.
 */

export async function usersInfo() {
  // Fetch all users
  try {
    const users = await prisma.users.findMany();
    return users;
  } catch (error) {
    return error;
  }
}
